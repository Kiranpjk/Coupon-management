import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BestCouponService } from '../src/services/BestCouponService.js';
import { CouponStore } from '../src/services/CouponStore.js';
import { NOW, coupon, cart, item, user } from './helpers.js';

const storeWith = (...coupons) => {
  const store = new CouponStore();
  store.coupons.clear();
  coupons.forEach((c) => store.addCoupon(c));
  return store;
};

test('returns null when no coupon is eligible', () => {
  const store = storeWith(coupon({ eligibility: { minCartValue: 10000 } }));
  assert.equal(BestCouponService.findBestCoupon(user(), cart(item('x', 100)), store, NOW), null);
});

test('picks the highest discount and reports prices', () => {
  const store = storeWith(
    coupon({ code: 'FLAT100', discountValue: 100 }),
    coupon({ code: 'PCT20', discountType: 'PERCENT', discountValue: 20 })
  );
  const result = BestCouponService.findBestCoupon(user(), cart(item('x', 1000)), store, NOW);
  assert.equal(result.coupon.code, 'PCT20');
  assert.equal(result.discountAmount, 200);
  assert.equal(result.originalPrice, 1000);
  assert.equal(result.finalPrice, 800);
});

test('tie-break 1: earliest end date wins', () => {
  const store = storeWith(
    coupon({ code: 'A', endDate: '2026-12-31' }),
    coupon({ code: 'B', endDate: '2026-09-30' })
  );
  assert.equal(BestCouponService.findBestCoupon(user(), cart(item('x', 1000)), store, NOW).coupon.code, 'B');
});

test('tie-break 2: lexicographically smaller code wins', () => {
  const store = storeWith(coupon({ code: 'ZETA' }), coupon({ code: 'ALPHA' }));
  assert.equal(BestCouponService.findBestCoupon(user(), cart(item('x', 1000)), store, NOW).coupon.code, 'ALPHA');
});

test('skips coupons whose per-user usage limit is reached', () => {
  const store = storeWith(
    coupon({ code: 'BIG', discountValue: 300, usageLimitPerUser: 1 }),
    coupon({ code: 'SMALL', discountValue: 50 })
  );
  assert.equal(BestCouponService.findBestCoupon(user(), cart(item('x', 1000)), store, NOW).coupon.code, 'BIG');
  store.incrementUsage('u1', 'BIG');
  assert.equal(BestCouponService.findBestCoupon(user(), cart(item('x', 1000)), store, NOW).coupon.code, 'SMALL');
  // other users are unaffected
  assert.equal(BestCouponService.findBestCoupon(user({ userId: 'u2' }), cart(item('x', 1000)), store, NOW).coupon.code, 'BIG');
});

test('usageLimitPerUser: null means unlimited', () => {
  const store = storeWith(coupon({ code: 'NOLIMIT', usageLimitPerUser: null }));
  assert.equal(BestCouponService.findBestCoupon(user(), cart(item('x', 1000)), store, NOW).coupon.code, 'NOLIMIT');
});

test('final price is never negative', () => {
  const store = storeWith(coupon({ code: 'HUGE', discountValue: 1000 }));
  const result = BestCouponService.findBestCoupon(user(), cart(item('x', 300)), store, NOW);
  assert.equal(result.discountAmount, 300);
  assert.equal(result.finalPrice, 0);
});
