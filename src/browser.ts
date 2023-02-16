import { default as SummitClient } from './index';

import { getIdentifier, getCookieStorage } from '@usesummit/utils';

import { SESSION_STORAGE_KEY, USER_STORAGE_KEY } from './constants/keys';

import {
    DEFAULT_BROWSER_OPTIONS,
    ApiKey,
    BrowserConfigurationOptions,
    EmbedAppIdentifier,
} from './types/SummitConfigurationOptions';

let getAnonymousUserId = () => '';
let resetAnonymousUserId = () => {};

let getSessionId = () => '';
let resetSessionId = () => {};

export default class SummitBrowserClient extends SummitClient {
    #embedBaseUrl: string = DEFAULT_BROWSER_OPTIONS.embedBaseUrl;

    constructor(options?: ApiKey | BrowserConfigurationOptions) {
        super(options);
    }

    configure(options: ApiKey | BrowserConfigurationOptions) {
        super.configure(options);

        if (typeof options !== 'string') {
            const { cookie: cookieOptions, embedBaseUrl } = {
                cookie: false,
                ...DEFAULT_BROWSER_OPTIONS,
                ...options,
            };

            [getAnonymousUserId, , resetAnonymousUserId] = getIdentifier(
                USER_STORAGE_KEY,
                undefined,
                cookieOptions
                    ? getCookieStorage(
                          typeof cookieOptions !== 'boolean'
                              ? cookieOptions
                              : {}
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

            this.#embedBaseUrl = embedBaseUrl;
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

    embed(app: EmbedAppIdentifier, targetNode: HTMLElement | string) {
        const {
            app: appIdentifier,
            embedBaseUrl = this.#embedBaseUrl,
            apiKey = this.apiKey,
        } = typeof app === 'string' ? { app } : app;

        const node =
            typeof targetNode === 'string'
                ? document.querySelector(targetNode)
                : targetNode;

        if (!node) {
            throw new Error('Embed target node not found');
        }

        const iframeUrl = new URL(embedBaseUrl);

        iframeUrl.pathname = `/embed/${appIdentifier}/`;

        this.identifiers.forEach((identifier) => {
            iframeUrl.searchParams.append('identifiers', identifier);
        });

        if (this.sessionId) {
            iframeUrl.searchParams.append('session_id', this.sessionId);
        }

        if (apiKey) {
            iframeUrl.searchParams.append('api_key', apiKey);
        }

        node.innerHTML = `
            <iframe src="${iframeUrl}" width="100%" height="100%" frameborder="0"></iframe>
        `;
    }
}
