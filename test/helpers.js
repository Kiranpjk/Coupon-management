export const NOW = new Date('2026-06-15T12:00:00Z');

export const coupon = (overrides = {}) => ({
  code: 'TEST',
  description: 'test coupon',
  discountType: 'FLAT',
  discountValue: 100,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  eligibility: {},
  ...overrides
});

export const cart = (...items) => ({ items });
export const item = (category, unitPrice, quantity = 1) => ({ productId: `p-${category}`, category, unitPrice, quantity });

export const user = (overrides = {}) => ({
  userId: 'u1',
  userTier: 'REGULAR',
  country: 'IN',
  lifetimeSpend: 0,
  ordersPlaced: 0,
  ...overrides
});
