import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DiscountService } from '../src/services/DiscountService.js';
import { coupon, cart, item } from './helpers.js';

test('FLAT discount returns discountValue', () => {
  assert.equal(DiscountService.calculateDiscount(coupon({ discountValue: 100 }), 1000), 100);
});

test('FLAT discount is capped at cart value (no negative final price)', () => {
  assert.equal(DiscountService.calculateDiscount(coupon({ discountValue: 500 }), 200), 200);
});

test('PERCENT discount is a percentage of cart value', () => {
  assert.equal(DiscountService.calculateDiscount(coupon({ discountType: 'PERCENT', discountValue: 20 }), 1000), 200);
});

test('PERCENT discount respects maxDiscountAmount', () => {
  const c = coupon({ discountType: 'PERCENT', discountValue: 50, maxDiscountAmount: 300 });
  assert.equal(DiscountService.calculateDiscount(c, 1000), 300);
});

test('PERCENT discount treats maxDiscountAmount: null as no cap', () => {
  const c = coupon({ discountType: 'PERCENT', discountValue: 10, maxDiscountAmount: null });
  assert.equal(DiscountService.calculateDiscount(c, 1000), 100);
});

test('PERCENT discount is rounded to 2 decimals', () => {
  const c = coupon({ discountType: 'PERCENT', discountValue: 15 });
  assert.equal(DiscountService.calculateDiscount(c, 999.99), 150);
  assert.equal(DiscountService.calculateDiscount(c, 10.01), 1.5);
});

test('unknown discount type gives 0', () => {
  assert.equal(DiscountService.calculateDiscount(coupon({ discountType: 'BOGO' }), 1000), 0);
});

test('calculateCartValue sums unitPrice * quantity', () => {
  assert.equal(DiscountService.calculateCartValue(cart(item('a', 100, 2), item('b', 50, 3))), 350);
  assert.equal(DiscountService.calculateCartValue(cart()), 0);
});
