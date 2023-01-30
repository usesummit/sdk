import { parseHumanReadableNumber } from '@usesummit/utils';

import { SimulationRun } from './types/SimulationRun';
import { SummitConfigurationOptions } from './types/SummitConfigurationOptions';

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

const defaultOptions = {
    baseUrl: 'https://api.usesummit.com/v1/',
};

class Summit {
    #apiBaseUrl = 'https://api.usesummit.com/v1/';

    #app: string | null = null;
    #apiKey: string | null = null;

    #sessionId: string | undefined = undefined;

    #identifiers: Set<string> = new Set();

    constructor(options?: string | SummitConfigurationOptions) {
        if (options) {
            this.configure(options);
        }
    }

    configure(options: string | SummitConfigurationOptions) {
        if (typeof options === 'string') {
            const { baseUrl: defaultBaseUrl } = defaultOptions;

            const {
                app: parsedApp,
                baseUrl: parsedBaseUrl,
                apiKey: parsedApiKey,
            } = forgivinglyParseAppIdentifier(options);

            this.#app = parsedApp;
            this.#apiKey = parsedApiKey;
            this.#apiBaseUrl = parsedBaseUrl ?? defaultBaseUrl;
        } else {
            let { app, apiKey, baseUrl } = { ...options, ...defaultOptions };

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

            if (!apiKey) {
                throw new Error('API key is required and could not be derived');
            }

            this.#app = app;
            this.#apiKey = apiKey;
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

    get sessionId(): string | undefined {
        return this.#sessionId;
    }

    set sessionId(sessionId: string | undefined) {
        this.#sessionId = sessionId;
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
            identifiers: Array.from(this.#identifiers),
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
    }

    unidentify() {
        this.#identifiers = new Set();
    }

    reset() {
        this.unidentify();
        this.#sessionId = undefined;
    }
}

export default Summit;
