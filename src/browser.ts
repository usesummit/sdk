import { default as SummitClient } from './index';

import { getIdentifier } from '@usesummit/utils';

import {
    DEFAULT_OPTIONS,
    SummitBrowserConfigurationOptions,
} from './types/SummitConfigurationOptions';

const USER_STORAGE_KEY = 'SUMMIT_ANONYMOUS_USER_IDENTIFIER';
const SESSION_STORAGE_KEY = 'SUMMIT_ANONYMOUS_SESSION_IDENTIFIER';

const [getAnonymousUserId, , resetAnonymousUserId] = getIdentifier(
    USER_STORAGE_KEY,
    undefined,
    window.localStorage
);

const [getSessionId, , resetSessionId] = getIdentifier(
    SESSION_STORAGE_KEY,
    undefined,
    window.sessionStorage
);

export default class SummitBrowserClient extends SummitClient {
    #embedBaseUrl: string = DEFAULT_OPTIONS.embedBaseUrl;

    constructor(options?: string | SummitBrowserConfigurationOptions) {
        super(options);
        this.addIdentifier(getAnonymousUserId());
    }

    configure(options: string | SummitBrowserConfigurationOptions) {
        super.configure(options);

        if (typeof options !== 'string' && options?.embedBaseUrl) {
            this.#embedBaseUrl = options.embedBaseUrl;
        }
    }

    get sessionId(): string | undefined {
        return getSessionId();
    }

    reset() {
        super.reset();
        resetAnonymousUserId();
        resetSessionId();
        this.addIdentifier(getAnonymousUserId());
    }

    embed(
        targetNode: HTMLElement | string,
        options?: SummitBrowserConfigurationOptions
    ) {
        if (options) {
            this.configure(options);
        }

        const node =
            typeof targetNode === 'string'
                ? document.querySelector(targetNode)
                : targetNode;

        if (!node) {
            throw new Error('Embed target node not found');
        }

        const iframeUrl = new URL(this.#embedBaseUrl);

        iframeUrl.pathname = `/embed/${this.app}/`;

        this.identifiers.forEach((identifier) => {
            iframeUrl.searchParams.append('identifiers', identifier);
        });

        if (this.sessionId) {
            iframeUrl.searchParams.append('session_id', this.sessionId);
        }

        if (this.apiKey) {
            iframeUrl.searchParams.append('api_key', this.apiKey);
        }

        node.innerHTML = `
            <iframe src="${iframeUrl}" width="100%" height="100%" frameborder="0"></iframe>
        `;
    }
}
