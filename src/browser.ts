import { default as SummitClient } from './index';

import { getCachedIdentifier } from './utils/getCachedIdentifier';

const USER_STORAGE_KEY = 'SUMMIT_ANONYMOUS_USER_IDENTIFIER';
const SESSION_STORAGE_KEY = 'SUMMIT_ANONYMOUS_SESSION_IDENTIFIER';

const [getPublicUserId, setPublicUserId, resetPublicUserId] =
    getCachedIdentifier(USER_STORAGE_KEY, window.localStorage);

const [getSessionId, setSessionId, resetSessionId] = getCachedIdentifier(
    SESSION_STORAGE_KEY,
    window.sessionStorage
);

class SummitBrowserClient extends SummitClient {
    get publicUserId(): string | undefined {
        return getPublicUserId();
    }

    set publicUserId(publicUserId: string | undefined) {
        setPublicUserId(publicUserId);
    }

    get sessionId(): string | undefined {
        return getSessionId();
    }

    set sessionId(sessionId: string | undefined) {
        setSessionId(sessionId);
    }

    reset() {
        super.reset();
        resetPublicUserId();
        resetSessionId();
    }
}

window.Summit = window.Summit || new SummitBrowserClient();
