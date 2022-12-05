import { parseHumanReadableNumber } from '@usesummit/utils';

import { SimulationRun } from './types/SimulationRun';

function parseHumanReadableNumberWithFallback(raw: string) {
    try {
        return parseHumanReadableNumber(raw);
    } catch (e) {
        return raw;
    }
}

class Summit {
    #app: string | null = null;
    #apiKey: string | null = null;

    #publicUserId: string | undefined = undefined;
    #sessionId: string | undefined = undefined;
    #externalUserId: string | undefined = undefined;

    configure(app: string, apiKey: string) {
        this.#app = app.replace(/^\//, '').replace(/$/, '');
        this.#apiKey = apiKey;
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

    prepare(parameters: Record<string, string> = {}) {
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

    run(parameters: Record<string, string> = {}): Promise<SimulationRun> {
        if (!this.#app || !this.#apiKey) {
            throw new Error(
                'Summit is not configured. Please call Summit.configure() first.'
            );
        }

        return fetch(`https://api.usesummit.com/v1/${this.#app}/`, {
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
