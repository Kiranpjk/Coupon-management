import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { coupon as baseCoupon } from './helpers.js';

// The API shares one in-memory store, so coupons created here use a future
// validity window and never affect the /best tests.
const coupon = (overrides = {}) => baseCoupon({ startDate: '2099-01-01', endDate: '2099-12-31', ...overrides });

describe('meta endpoints', () => {
  test('GET /health', async () => {
    const res = await request(app).get('/health').expect(200);
    assert.equal(res.body.success, true);
  });

  test('GET / lists endpoints', async () => {
    const res = await request(app).get('/').expect(200);
    assert.ok(res.body.endpoints);
  });

  test('unknown route returns 404 JSON', async () => {
    const res = await request(app).get('/nope').expect(404);
    assert.equal(res.body.success, false);
  });

  test('malformed JSON returns 400', async () => {
    await request(app).post('/api/coupons').set('Content-Type', 'application/json').send('{bad').expect(400);
  });
});

describe('GET /api/coupons', () => {
  test('returns seed coupons with count', async () => {
    const res = await request(app).get('/api/coupons').expect(200);
    assert.equal(res.body.count, res.body.data.length);
    assert.ok(res.body.data.some((c) => c.code === 'SAVE20'));
  });
});

describe('POST /api/coupons', () => {
  test('creates a coupon', async () => {
    const res = await request(app).post('/api/coupons').send(coupon({ code: 'API_CREATE' })).expect(201);
    assert.equal(res.body.data.code, 'API_CREATE');
    const list = await request(app).get('/api/coupons');
    assert.ok(list.body.data.some((c) => c.code === 'API_CREATE'));
  });

  test('rejects duplicate code', async () => {
    await request(app).post('/api/coupons').send(coupon({ code: 'API_DUP' })).expect(201);
    const res = await request(app).post('/api/coupons').send(coupon({ code: 'API_DUP' })).expect(400);
    assert.match(res.body.error, /already exists/);
  });

  test('rejects missing required fields', async () => {
    const res = await request(app).post('/api/coupons').send({ code: 'X' }).expect(400);
    assert.match(res.body.error, /Missing required fields/);
  });

  test('accepts discountValue 0 (present but falsy)', async () => {
    await request(app).post('/api/coupons').send(coupon({ code: 'API_ZERO', discountValue: 0 })).expect(201);
  });

  for (const [name, overrides, msg] of [
    ['invalid discountType', { discountType: 'BOGO' }, /FLAT or PERCENT/],
    ['string discountValue', { discountValue: '100' }, /discountValue/],
    ['negative discountValue', { discountValue: -5 }, /discountValue/],
    ['PERCENT over 100', { discountType: 'PERCENT', discountValue: 150 }, /<= 100/],
    ['invalid date', { startDate: 'tomorrow' }, /valid dates/],
    ['start after end', { startDate: '2099-12-31', endDate: '2099-01-01' }, /on or before/],
    ['negative maxDiscountAmount', { maxDiscountAmount: -1 }, /maxDiscountAmount/],
    ['eligibility not an object', { eligibility: 'all' }, /eligibility/]
  ]) {
    test(`rejects ${name}`, async () => {
      const res = await request(app).post('/api/coupons').send(coupon({ code: `API_BAD_${name}`, ...overrides })).expect(400);
      assert.match(res.body.error, msg);
    });
  }
});

describe('POST /api/coupons/best', () => {
  const body = (user, items) => ({ user: { userId: 'api-user', ...user }, cart: { items } });

  test('README scenario 1: first-time user gets WELCOME100', async () => {
    const res = await request(app).post('/api/coupons/best')
      .send(body({ userTier: 'NEW', country: 'IN', lifetimeSpend: 0, ordersPlaced: 0 },
        [{ productId: 'p1', category: 'electronics', unitPrice: 600, quantity: 1 }]))
      .expect(200);
    assert.equal(res.body.data.coupon.code, 'WELCOME100');
    assert.equal(res.body.data.finalPrice, 500);
  });

  test('README scenario 3: loyal customer gets LOYAL25', async () => {
    const res = await request(app).post('/api/coupons/best')
      .send(body({ userTier: 'REGULAR', country: 'IN', lifetimeSpend: 6000, ordersPlaced: 8 },
        [{ productId: 'p1', category: 'electronics', unitPrice: 2500, quantity: 1 }]))
      .expect(200);
    assert.equal(res.body.data.coupon.code, 'LOYAL25');
    assert.equal(res.body.data.discountAmount, 625);
  });

  test('returns data: null when nothing matches', async () => {
    const res = await request(app).post('/api/coupons/best')
      .send(body({ userTier: 'NEW', country: 'DE', ordersPlaced: 3 },
        [{ productId: 'p1', category: 'toys', unitPrice: 10, quantity: 1 }]))
      .expect(200);
    assert.equal(res.body.data, null);
  });

  for (const [name, payload, msg] of [
    ['missing user and cart', {}, /user and cart/],
    ['missing userId', { user: {}, cart: { items: [] } }, /userId/],
    ['items not an array', { user: { userId: 'a' }, cart: { items: 'x' } }, /must be an array/],
    ['non-numeric unitPrice', { user: { userId: 'a' }, cart: { items: [{ unitPrice: '10', quantity: 1 }] } }, /unitPrice/],
    ['fractional quantity', { user: { userId: 'a' }, cart: { items: [{ unitPrice: 10, quantity: 1.5 }] } }, /quantity/]
  ]) {
    test(`rejects ${name}`, async () => {
      const res = await request(app).post('/api/coupons/best').send(payload).expect(400);
      assert.match(res.body.error, msg);
    });
  }
});
