const IDENTIFIER_FORMAT = /([a-zA-Z0-9-]+)\/([0-9abcdef]{6})\/([a-zA-Z0-9-]+)/;

export default function parseAppIdentifier(identifier: string) {
    const cleanedIdentifier = identifier
        .replace(/^(\/)+/, '')
        .replace(/(\/)+$/, '');

    const match = cleanedIdentifier.match(IDENTIFIER_FORMAT);

    if (!match) {
        throw new Error(`Invalid app identifier format: ${identifier}`);
    }

    return cleanedIdentifier;
}
