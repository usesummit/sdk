import { CookieStorageOptions } from '@usesummit/utils';

export type ApiKey = string;

export type ConfigurationOptions = {
    apiKey?: string;
    baseUrl?: string;
};

export type BrowserConfigurationOptions = ConfigurationOptions & {
    embedBaseUrl?: string;
    cookie?: true | CookieStorageOptions;
};

export type RunAppIdentifier =
    | string
    | (ConfigurationOptions & { app: string });

export type EmbedAppIdentifier =
    | string
    | (Exclude<BrowserConfigurationOptions, 'cookie'> & { app: string });

export const DEFAULT_OPTIONS = Object.freeze({
    baseUrl: 'https://api.usesummit.com/v1',
});

export const DEFAULT_BROWSER_OPTIONS = Object.freeze({
    ...DEFAULT_OPTIONS,
    embedBaseUrl: 'https://usesummit.com/embed',
});
