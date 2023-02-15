import parseAppIdentifier from './parseAppIdentifier';

export default function forgivinglyParseAppIdentifier(identifier: string): {
    app: string;
    baseUrl: string | undefined;
    apiKey: string | undefined;
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
                parsed.searchParams.get('api_key') ?? undefined,
            ];
        } catch (e) {
            return [identifier, undefined, undefined];
        }
    })();

    return {
        app: parseAppIdentifier(parsedIdentifier),
        baseUrl,
        apiKey,
    };
}
