const identifierFormat = /([a-zA-Z0-9-]+)\/([0-9abcdef]{6})\/([a-zA-Z0-9-]+)/;

export default function forgivinglyParseAppIdentifier(identifier: string) {
    const parsedIdentifier = (() => {
        try {
            const parsed = new URL(identifier);

            // If this doesn't throw, the implementation
            // accidentally added a whole URL (either to hosted app or the endpoint)
            // instead of only the identifier, and we want to be forgiving for that case.

            const path = parsed.pathname;

            return path.replace(/^\/v[0-9]+\//, '');
        } catch (e) {
            return identifier;
        }
    })();

    const cleanedIdentifier = parsedIdentifier
        .replace(/^(\/)+/, '')
        .replace(/(\/)+$/, '');

    const match = cleanedIdentifier.match(identifierFormat);

    if (!match) {
        throw new Error(`Invalid app identifier format: ${identifier}`);
    }

    return cleanedIdentifier;
}
