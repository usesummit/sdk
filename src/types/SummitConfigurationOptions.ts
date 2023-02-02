export type SummitConfigurationOptions = {
    app: string;
    apiKey?: string;
    baseUrl?: string;
};

export type SummitBrowserConfigurationOptions = SummitConfigurationOptions & {
    embedBaseUrl?: string;
};

export const DEFAULT_OPTIONS = Object.freeze({
    baseUrl: 'https://api.usesummit.com/v1',
    embedBaseUrl: 'https://usesummit.com/embed',
});
