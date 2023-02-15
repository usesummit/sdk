import { test, expect } from '@jest/globals';

import forgivinglyParseAppIdentifier from './forgivinglyParseAppIdentifier';

test('does work with full API URL', () => {
    expect(
        forgivinglyParseAppIdentifier(
            'https://api.usesummit.com/v1/summit-agency/db86be/exit-waterfall-calculator/'
        )
    ).toEqual({
        app: 'summit-agency/db86be/exit-waterfall-calculator',
        baseUrl: 'https://api.usesummit.com/v1/',
        apiKey: undefined,
    });
});

test('does work with full API URL and API key', () => {
    expect(
        forgivinglyParseAppIdentifier(
            'https://api.usesummit.com/v1/summit-agency/db86be/exit-waterfall-calculator/?api_key=5up3r53cr3t'
        )
    ).toEqual({
        app: 'summit-agency/db86be/exit-waterfall-calculator',
        baseUrl: 'https://api.usesummit.com/v1/',
        apiKey: '5up3r53cr3t',
    });
});
