import { parseHumanReadableNumber } from '@usesummit/utils';

import { SimulationRun } from './types/SimulationRun';
import {
    DEFAULT_OPTIONS,
    SummitConfigurationOptions,
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
    #apiBaseUrl: string = DEFAULT_OPTIONS.baseUrl;

    get apiBaseUrl(): string {
        return this.#apiBaseUrl;
    }

    #app: string | null = null;

    get app(): string | null {
        return this.#app;
    }

    #apiKey: string | null = null;

    #sessionId: string | undefined = undefined;

    get sessionId(): string | undefined {
        return this.#sessionId;
    }

    set sessionId(sessionId: string | undefined) {
        this.#sessionId = sessionId;
    }

    #identifiers: Set<string> = new Set();

    get identifiers() {
        return Array.from(this.#identifiers);
    }

    constructor(options?: string | SummitConfigurationOptions) {
        if (options) {
            this.configure(options);
        }
    }

    configure(options: string | SummitConfigurationOptions) {
        if (typeof options === 'string') {
            const { baseUrl: defaultBaseUrl } = DEFAULT_OPTIONS;

            const {
                app: parsedApp,
                baseUrl: parsedBaseUrl,
                apiKey: parsedApiKey,
            } = forgivinglyParseAppIdentifier(options);

            this.#app = parsedApp;
            this.#apiKey = parsedApiKey;
            this.#apiBaseUrl = parsedBaseUrl ?? defaultBaseUrl;
        } else {
            let { app, apiKey, baseUrl } = { ...DEFAULT_OPTIONS, ...options };

            if (!app) {
                throw new Error('App identifier is required');
            }

            const {
                app: parsedApp,
                baseUrl: parsedBaseUrl,
                apiKey: parsedApiKey,
            } = forgivinglyParseAppIdentifier(app);

            app = parsedApp;

            if (parsedApiKey) {
                apiKey = parsedApiKey;
            }

            if (parsedBaseUrl) {
                baseUrl = parsedBaseUrl;
            }

            this.#app = app;
            this.#apiKey = apiKey ?? null;
            this.#apiBaseUrl = baseUrl;
        }
    }

    addIdentifier(identifier: string): void {
        this.#identifiers.add(identifier);
    }

    set publicUserId(publicUserId: string) {
        console.warn(
            '`publicUserId` is deprecated. Use `addIdentifier` directly instead.'
        );
        this.addIdentifier(publicUserId);
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
            identifiers: this.identifiers,
            session_id: this.sessionId,
        };
    }

    run<T = Record<string, number>>(
        parameters: FormData | Record<string, string | number> = {},
        options?: SimulationOptions
    ): Promise<SimulationRun<T>> {
        if (!this.#app || !this.#apiKey) {
            throw new Error(
                'Summit is not configured. Please call Summit.configure() first.'
            );
        }

        const body = {
            ...this.prepare(parameters),
            ...(options ? { options } : {}),
        };

        return fetch(`${this.#apiBaseUrl}/${this.#app}/`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.#apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((res) => res.json());
    }

    identify(identifier: string) {
        this.addIdentifier(identifier);
        this.syncIdentifiers();
    }

    unidentify() {
        this.#identifiers = new Set();
    }

    syncIdentifiers(): Promise<void> {
        if (!this.#app || !this.#apiKey) {
            // If the app is not yet configured, we won't sync the identifiersf
            // and instead for either a run, an embed (in browser context), or a specific syncIdentifiers call
            //
            // We could also consider implementing a queuing system and sync the identifiers once the app is configured
            console.warn('Summit is not configured, not syncing identifiers');
            return Promise.resolve();
        }

        if (this.#identifiers.size === 0) {
            console.warn('No identifiers to sync');
            return Promise.resolve();
        }

        return fetch(`${this.#apiBaseUrl}/identify/`, {
            method: 'PUT',
            headers: {
                'X-Api-Key': this.#apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identifiers: this.identifiers,
            }),
        }).then((res) => res.json());
    }

    reset() {
        this.unidentify();
        this.#sessionId = undefined;
    }
}

export default Summit;
