import { test, expect } from '@jest/globals';

import forgivinglyParseAppIdentifier from './forgivinglyParseAppIdentifier';

test('supports correct identifiers', () => {
    expect(
        forgivinglyParseAppIdentifier(
            'summit-agency/db86be/exit-waterfall-calculator'
        )
    ).toBe('summit-agency/db86be/exit-waterfall-calculator');
});

test('does not trip over leading or trailing slashes', () => {
    expect(
        forgivinglyParseAppIdentifier(
            '/summit-agency/db86be/exit-waterfall-calculator'
        )
    ).toBe('summit-agency/db86be/exit-waterfall-calculator');
    expect(
        forgivinglyParseAppIdentifier(
            'summit-agency/db86be/exit-waterfall-calculator/'
        )
    ).toBe('summit-agency/db86be/exit-waterfall-calculator');
    expect(
        forgivinglyParseAppIdentifier(
            '/summit-agency/db86be/exit-waterfall-calculator/'
        )
    ).toBe('summit-agency/db86be/exit-waterfall-calculator');
});

test('does work with full API URL', () => {
    expect(
        forgivinglyParseAppIdentifier(
            'https://api.usesummit.com/v1/summit-agency/db86be/exit-waterfall-calculator/'
        )
    ).toBe('summit-agency/db86be/exit-waterfall-calculator');
});

test('does work with full hosted app URL', () => {
    expect(
        forgivinglyParseAppIdentifier(
            'https://usesummit.com/summit-agency/db86be/exit-waterfall-calculator/'
        )
    ).toBe('summit-agency/db86be/exit-waterfall-calculator');
});

test('does work with testing domains', () => {
    expect(
        forgivinglyParseAppIdentifier(
            'https://totally-fake-staging.get-porter.dev/summit-agency/db86be/exit-waterfall-calculator/'
        )
    ).toBe('summit-agency/db86be/exit-waterfall-calculator');
    expect(
        forgivinglyParseAppIdentifier(
            'http://localhost:8000/summit-agency/db86be/exit-waterfall-calculator/'
        )
    ).toBe('summit-agency/db86be/exit-waterfall-calculator');
});
