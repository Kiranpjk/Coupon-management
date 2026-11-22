import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { EligibilityService as E } from '../src/services/EligibilityService.js';
import { NOW, coupon, cart, item, user } from './helpers.js';

describe('isWithinValidityPeriod', () => {
  test('inside, before and after the window', () => {
    assert.equal(E.isWithinValidityPeriod('2026-01-01', '2026-12-31', NOW), true);
    assert.equal(E.isWithinValidityPeriod('2026-07-01', '2026-12-31', NOW), false);
    assert.equal(E.isWithinValidityPeriod('2026-01-01', '2026-06-14', NOW), false);
  });

  test('end date is inclusive until 23:59:59.999 UTC', () => {
    assert.equal(E.isWithinValidityPeriod('2026-01-01', '2026-06-15', new Date('2026-06-15T23:59:59.999Z')), true);
    assert.equal(E.isWithinValidityPeriod('2026-01-01', '2026-06-15', new Date('2026-06-16T00:00:00.000Z')), false);
  });

  test('invalid dates are never valid', () => {
    assert.equal(E.isWithinValidityPeriod('not-a-date', '2026-12-31', NOW), false);
  });
});

describe('checkUserEligibility', () => {
  test('empty rules allow everyone', () => {
    assert.equal(E.checkUserEligibility({}, user()), true);
  });

  test('allowedUserTiers', () => {
    const rules = { allowedUserTiers: ['GOLD'] };
    assert.equal(E.checkUserEligibility(rules, user({ userTier: 'GOLD' })), true);
    assert.equal(E.checkUserEligibility(rules, user({ userTier: 'NEW' })), false);
    assert.equal(E.checkUserEligibility({ allowedUserTiers: [] }, user()), true);
  });

  test('minLifetimeSpend and minOrdersPlaced', () => {
    const rules = { minLifetimeSpend: 5000, minOrdersPlaced: 5 };
    assert.equal(E.checkUserEligibility(rules, user({ lifetimeSpend: 5000, ordersPlaced: 5 })), true);
    assert.equal(E.checkUserEligibility(rules, user({ lifetimeSpend: 4999, ordersPlaced: 5 })), false);
    assert.equal(E.checkUserEligibility(rules, user({ lifetimeSpend: 5000, ordersPlaced: 4 })), false);
  });

  test('missing lifetimeSpend / ordersPlaced are treated as 0, not as eligible', () => {
    assert.equal(E.checkUserEligibility({ minLifetimeSpend: 1 }, { userId: 'x' }), false);
    assert.equal(E.checkUserEligibility({ minOrdersPlaced: 1 }, { userId: 'x' }), false);
  });

  test('firstOrderOnly', () => {
    assert.equal(E.checkUserEligibility({ firstOrderOnly: true }, user({ ordersPlaced: 0 })), true);
    assert.equal(E.checkUserEligibility({ firstOrderOnly: true }, user({ ordersPlaced: 1 })), false);
  });

  test('allowedCountries', () => {
    assert.equal(E.checkUserEligibility({ allowedCountries: ['IN'] }, user({ country: 'IN' })), true);
    assert.equal(E.checkUserEligibility({ allowedCountries: ['IN'] }, user({ country: 'DE' })), false);
  });
});

describe('checkCartEligibility', () => {
  const c = cart(item('fashion', 300, 2), item('books', 100, 1)); // value 700, 3 items

  test('minCartValue', () => {
    assert.equal(E.checkCartEligibility({ minCartValue: 700 }, c), true);
    assert.equal(E.checkCartEligibility({ minCartValue: 701 }, c), false);
  });

  test('applicableCategories needs at least one match', () => {
    assert.equal(E.checkCartEligibility({ applicableCategories: ['fashion', 'toys'] }, c), true);
    assert.equal(E.checkCartEligibility({ applicableCategories: ['electronics'] }, c), false);
  });

  test('excludedCategories rejects any match', () => {
    assert.equal(E.checkCartEligibility({ excludedCategories: ['books'] }, c), false);
    assert.equal(E.checkCartEligibility({ excludedCategories: ['toys'] }, c), true);
  });

  test('minItemsCount uses the sum of quantities', () => {
    assert.equal(E.checkCartEligibility({ minItemsCount: 3 }, c), true);
    assert.equal(E.checkCartEligibility({ minItemsCount: 4 }, c), false);
  });
});

describe('isEligible', () => {
  test('combines validity, user and cart rules', () => {
    const c = coupon({ eligibility: { allowedUserTiers: ['GOLD'], minCartValue: 500 } });
    assert.equal(E.isEligible(c, user({ userTier: 'GOLD' }), cart(item('x', 500)), NOW), true);
    assert.equal(E.isEligible(c, user({ userTier: 'NEW' }), cart(item('x', 500)), NOW), false);
    assert.equal(E.isEligible(c, user({ userTier: 'GOLD' }), cart(item('x', 499)), NOW), false);
    assert.equal(E.isEligible(c, user({ userTier: 'GOLD' }), cart(item('x', 500)), new Date('2027-01-01')), false);
  });

  test('coupon without eligibility object is eligible inside its window', () => {
    const c = coupon();
    delete c.eligibility;
    assert.equal(E.isEligible(c, user(), cart(item('x', 1)), NOW), true);
  });
});
