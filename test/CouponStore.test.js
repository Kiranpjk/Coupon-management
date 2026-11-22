import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CouponStore } from '../src/services/CouponStore.js';
import { EligibilityService } from '../src/services/EligibilityService.js';
import { coupon } from './helpers.js';

test('loads 7 seed coupons that are currently valid', () => {
  const store = new CouponStore();
  const all = store.getAllCoupons();
  assert.equal(all.length, 7);
  for (const c of all) {
    assert.ok(EligibilityService.isWithinValidityPeriod(c.startDate, c.endDate), `${c.code} is expired`);
  }
});

test('addCoupon / getCouponByCode and duplicate rejection', () => {
  const store = new CouponStore();
  store.addCoupon(coupon({ code: 'NEW1' }));
  assert.equal(store.getCouponByCode('NEW1').code, 'NEW1');
  assert.equal(store.getCouponByCode('MISSING'), null);
  assert.throws(() => store.addCoupon(coupon({ code: 'NEW1' })), /already exists/);
});

test('usage tracking per user and coupon', () => {
  const store = new CouponStore();
  assert.equal(store.getUserUsageCount('u1', 'SAVE20'), 0);
  store.incrementUsage('u1', 'SAVE20');
  store.incrementUsage('u1', 'SAVE20');
  assert.equal(store.getUserUsageCount('u1', 'SAVE20'), 2);
  assert.equal(store.getUserUsageCount('u1', 'GOLD50'), 0);
  assert.equal(store.getUserUsageCount('u2', 'SAVE20'), 0);
});
