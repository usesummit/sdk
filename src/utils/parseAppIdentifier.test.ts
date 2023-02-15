import { test, expect } from '@jest/globals';

import parseAppIdentifier from './parseAppIdentifier';

test('supports correct identifiers', () => {
    expect(
        parseAppIdentifier('summit-agency/db86be/exit-waterfall-calculator')
    ).toEqual('summit-agency/db86be/exit-waterfall-calculator');
});

test('does not trip over leading or trailing slashes', () => {
    expect(
        parseAppIdentifier('/summit-agency/db86be/exit-waterfall-calculator')
    ).toEqual('summit-agency/db86be/exit-waterfall-calculator');
    expect(
        parseAppIdentifier('summit-agency/db86be/exit-waterfall-calculator/')
    ).toEqual('summit-agency/db86be/exit-waterfall-calculator');
    expect(
        parseAppIdentifier('/summit-agency/db86be/exit-waterfall-calculator/')
    ).toEqual('summit-agency/db86be/exit-waterfall-calculator');
});
