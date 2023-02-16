import { parseHumanReadableNumber } from '@usesummit/utils';

import { SimulationRun } from './types/SimulationRun';
import {
    DEFAULT_OPTIONS,
    ApiKey,
    ConfigurationOptions,
    RunAppIdentifier,
} from './types/SummitConfigurationOptions';

import forgivinglyParseAppIdentifier from './utils/forgivinglyParseAppIdentifier';

function parseHumanReadableNumberWithFallback(raw: string | number) {
    if (typeof raw === 'number') {
        return raw;
    }

    try {
        return parseHumanReadableNumber(raw);
    } catch (e) {
        return raw;
    }
}

type SimulationOptions = {
    start?: string;
    end?: string;
    resolution?: string;
};

class Summit {
    protected apiBaseUrl: string = DEFAULT_OPTIONS.baseUrl;
    protected apiKey: ApiKey | null = null;

    public sessionId: string | undefined = undefined;
    protected _identifiers: Set<string> = new Set();

    get identifiers() {
        return Array.from(this._identifiers);
    }

    constructor(options?: ApiKey | ConfigurationOptions) {
        if (options) {
            this.configure(options);
        }
    }

    configure(options: ApiKey | ConfigurationOptions) {
        const { apiKey, baseUrl } = {
            ...DEFAULT_OPTIONS,
            ...(typeof options === 'string' ? { apiKey: options } : options),
        };

        if (!apiKey) {
            throw new Error('`apiKey` is required');
        }

        this.apiKey = apiKey;
        this.apiBaseUrl = baseUrl;
    }

    prepare(parameters: FormData | Record<string, string | number> = {}) {
        const entries =
            parameters instanceof FormData
                ? Array.from(
                      parameters.entries(),
                      ([key, value]) =>
                          [key, value.toString()] as [string, string]
                  )
                : Object.entries(parameters);

        const parsedParameters = Object.fromEntries(
            entries.map(([key, value]) => [
                key,
                parseHumanReadableNumberWithFallback(value),
            ])
        );

        return {
            parameters: parsedParameters,
            identifiers: this._identifiers,
            session_id: this.sessionId,
        };
    }

    run<T = Record<string, number>>(
        app: RunAppIdentifier,
        parameters: FormData | Record<string, string | number> = {},
        options?: SimulationOptions
    ): Promise<SimulationRun<T>> {
        const {
            app: appIdentifier,
            baseUrl = this.apiBaseUrl,
            apiKey = this.apiKey,
        } = typeof app === 'string'
            ? forgivinglyParseAppIdentifier(app)
            : {
                  ...forgivinglyParseAppIdentifier(app.app),
                  ...(app.baseUrl ? { baseUrl: app.baseUrl } : {}),
                  ...(app.apiKey ? { apiKey: app.apiKey } : {}),
              };

        if (!apiKey) {
            throw new Error('`apiKey` is required');
        }

        const body = {
            ...this.prepare(parameters),
            ...(options ? { options } : {}),
        };

        return fetch(`${baseUrl}${appIdentifier}/`, {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((res) => res.json());
    }

    addIdentifier(identifier: string): void {
        this._identifiers.add(identifier);
    }

    identify(identifier: string) {
        this.addIdentifier(identifier);
        this.syncIdentifiers();
    }

    unidentify() {
        this._identifiers = new Set();
    }

    syncIdentifiers(): Promise<void> {
        if (!this.apiKey) {
            // If the app is not yet configured, we won't sync the identifiers
            // and instead for either a run, an embed (in browser context), or a specific syncIdentifiers call
            //
            // We could also consider implementing a queuing system and sync the identifiers once the app is configured
            console.warn(
                'Summit does not have an API key, not syncing identifiers. Syncing might still happen on the first run'
            );
            return Promise.resolve();
        }

        if (this.identifiers.length === 0) {
            console.warn('No identifiers to sync');
            return Promise.resolve();
        }

        return fetch(`${this.apiBaseUrl}/identify/`, {
            method: 'PUT',
            headers: {
                'X-Api-Key': this.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identifiers: this.identifiers,
            }),
        }).then((res) => res.json());
    }

    reset() {
        this.unidentify();
        this.sessionId = undefined;
    }
}

export default Summit;
