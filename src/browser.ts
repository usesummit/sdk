import { default as SummitClient } from './index';

import { getIdentifier, getCookieStorage } from '@usesummit/utils';

import {
    DEFAULT_OPTIONS,
    SummitBrowserConfigurationOptions,
} from './types/SummitConfigurationOptions';

const USER_STORAGE_KEY = 'SUMMIT_ANONYMOUS_USER_IDENTIFIER';
const SESSION_STORAGE_KEY = 'SUMMIT_ANONYMOUS_SESSION_IDENTIFIER';

let getAnonymousUserId = () => '';
let resetAnonymousUserId = () => {};

let getSessionId = () => '';
let resetSessionId = () => {};

export default class SummitBrowserClient extends SummitClient {
    #embedBaseUrl: string = DEFAULT_OPTIONS.embedBaseUrl;

    constructor(options?: string | SummitBrowserConfigurationOptions) {
        super(options);
    }

    configure(options: string | SummitBrowserConfigurationOptions) {
        super.configure(options);

        const cookieOptions =
            options && typeof options !== 'string' && options.cookie;

        [getAnonymousUserId, , resetAnonymousUserId] = getIdentifier(
            USER_STORAGE_KEY,
            undefined,
            cookieOptions
                ? getCookieStorage(
                      typeof cookieOptions !== 'boolean' ? cookieOptions : {}
                  )
                : 'localStorage'
        );

        [getSessionId, , resetSessionId] = getIdentifier(
            SESSION_STORAGE_KEY,
            undefined,
            cookieOptions
                ? getCookieStorage(
                      typeof cookieOptions !== 'boolean'
                          ? {
                                ...cookieOptions,
                                maxAge: undefined,
                                expires: undefined,
                            }
                          : { maxAge: undefined, expires: undefined }
                  )
                : 'sessionStorage'
        );

        this.addIdentifier(getAnonymousUserId());

        if (cookieOptions) {
            // Call the getter so that the new value is set,
            // and in case of cookies, will be sent on subsequent network requests
            getSessionId();
        }

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

        // Call the getter so that the new value is set
        // and will be sent on subsequent network requests
        getSessionId();
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
