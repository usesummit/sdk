import { default as SummitClient } from './index';

import { getIdentifier } from '@usesummit/utils';

const USER_STORAGE_KEY = 'SUMMIT_ANONYMOUS_USER_IDENTIFIER';
const SESSION_STORAGE_KEY = 'SUMMIT_ANONYMOUS_SESSION_IDENTIFIER';

const [getPublicUserId, setPublicUserId, resetPublicUserId] = getIdentifier(
    USER_STORAGE_KEY,
    undefined,
    window.localStorage
);

const [getSessionId, setSessionId, resetSessionId] = getIdentifier(
    SESSION_STORAGE_KEY,
    undefined,
    window.sessionStorage
);

export default class SummitBrowserClient extends SummitClient {
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
