// @todo - This should not be copied from the `utils` package
export type CookieOptions = {
    domain?: string | null;
    path?: string;
    secure?: boolean;
    sameSite?: 'Lax' | 'Strict' | 'None';
    maxAge?: number;
    expires?: Date | null;
};

// @todo - This should not be copied from the `utils` package
export type CookieStorageOptions = CookieOptions & {
    prefix?: string;
};

export type SummitConfigurationOptions = {
    app: string;
    apiKey?: string;
    baseUrl?: string;
};

export type SummitBrowserConfigurationOptions = SummitConfigurationOptions & {
    embedBaseUrl?: string;
    cookie: true | CookieStorageOptions;
};

export const DEFAULT_OPTIONS = Object.freeze({
    baseUrl: 'https://api.usesummit.com/v1',
    embedBaseUrl: 'https://usesummit.com/embed',
});
