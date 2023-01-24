import { parseHumanReadableNumber } from '@usesummit/utils';

import { SimulationRun } from './types/SimulationRun';
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

type SummitConfigurationOptions = {
    app: string;
    apiKey?: string;
    baseUrl?: string;
};

const defaultOptions = {
    baseUrl: 'https://api.usesummit.com/v1/',
};

class Summit {
    #apiBaseUrl = 'https://api.usesummit.com/v1/';

    #app: string | null = null;
    #apiKey: string | null = null;

    #publicUserId: string | undefined = undefined;
    #sessionId: string | undefined = undefined;
    #externalUserId: string | undefined = undefined;

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

    get publicUserId(): string | undefined {
        return this.#publicUserId;
    }

    set publicUserId(publicUserId: string | undefined) {
        this.#publicUserId = publicUserId;
    }

    get sessionId(): string | undefined {
        return this.#sessionId;
    }

    set sessionId(sessionId: string | undefined) {
        this.#sessionId = sessionId;
    }

    prepare(parameters: Record<string, string | number> = {}) {
        const parsedParameters = Object.fromEntries(
            Object.entries(parameters).map(([key, value]) => [
                key,
                parseHumanReadableNumberWithFallback(value),
            ])
        );

        return {
            parameters: parsedParameters,
            external_user_id: this.#externalUserId,
            public_user_id: this.publicUserId,
            session_id: this.sessionId,
        };
    }

    run<T = Record<string, number>>(
        parameters: Record<string, string | number> = {}
    ): Promise<SimulationRun<T>> {
        if (!this.#app || !this.#apiKey) {
            throw new Error(
                'Summit is not configured. Please call Summit.configure() first.'
            );
        }

        return fetch(`${this.#apiBaseUrl}/${this.#app}/`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.#apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.prepare(parameters)),
        }).then((res) => res.json());
    }

    identify(externalUserId: string) {
        this.#externalUserId = externalUserId;
    }

    unidentify() {
        this.#externalUserId = undefined;
    }

    reset() {
        this.#externalUserId = undefined;
        this.#publicUserId = undefined;
        this.#sessionId = undefined;
    }
}

export default Summit;
