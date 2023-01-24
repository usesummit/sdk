const identifierFormat = /([a-zA-Z0-9-]+)\/([0-9abcdef]{6})\/([a-zA-Z0-9-]+)/;

export default function forgivinglyParseAppIdentifier(identifier: string): {
    app: string;
    baseUrl: string | null;
    apiKey: string | null;
} {
    const [parsedIdentifier, baseUrl, apiKey] = (() => {
        try {
            const parsed = new URL(identifier);

            // If this doesn't throw, the implementation
            // accidentally added a whole URL (either to hosted app or the endpoint)
            // instead of only the identifier, and we want to be forgiving for that case.

            const baseUrl = parsed.origin;

            const [, version, app] = parsed.pathname.match(
                /^\/(v[0-9]+)\/(.*)/
            ) ?? [, '', ''];

            return [
                app,
                `${baseUrl}/${version}/`,
                parsed.searchParams.get('api_key') ?? null,
            ];
        } catch (e) {
            return [identifier, null, null];
        }
    })();

    const cleanedIdentifier = parsedIdentifier
        .replace(/^(\/)+/, '')
        .replace(/(\/)+$/, '');

    const match = cleanedIdentifier.match(identifierFormat);

    if (!match) {
        throw new Error(`Invalid app identifier format: ${identifier}`);
    }

    return { app: cleanedIdentifier, baseUrl, apiKey };
}
