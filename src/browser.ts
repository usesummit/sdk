import { default as SummitClient } from './index';

import { getIdentifier } from '@usesummit/utils';

import { SummitConfigurationOptions } from './types/SummitConfigurationOptions';

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
    constructor(options?: string | SummitConfigurationOptions) {
        super(options);
        this.addIdentifier(getAnonymousUserId());
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
}
