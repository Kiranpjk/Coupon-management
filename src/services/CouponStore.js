/**
 * In-memory storage for coupons and user usage tracking
 * This serves as our database for the demo
 */

class CouponStore {
  constructor() {
    this.coupons = new Map(); // code -> coupon
    this.userUsage = new Map(); // userId -> Map(couponCode -> usageCount)
    this.initializeSeedData();
  }

  /**
   * Add a new coupon to the store
   * @param {Object} coupon - Coupon object
   * @returns {Object} Added coupon
   */
  addCoupon(coupon) {
    if (this.coupons.has(coupon.code)) {
      throw new Error(`Coupon with code '${coupon.code}' already exists`);
    }
    this.coupons.set(coupon.code, coupon);
    return coupon;
  }

  /**
   * Get all coupons
   * @returns {Array} Array of all coupons
   */
  getAllCoupons() {
    return Array.from(this.coupons.values());
  }

  /**
   * Get a specific coupon by code
   * @param {string} code - Coupon code
   * @returns {Object|null} Coupon or null
   */
  getCouponByCode(code) {
    return this.coupons.get(code) || null;
  }

  /**
   * Get usage count for a user and coupon
   * @param {string} userId - User ID
   * @param {string} couponCode - Coupon code
   * @returns {number} Usage count
   */
  getUserUsageCount(userId, couponCode) {
    if (!this.userUsage.has(userId)) {
      return 0;
    }
    const userCoupons = this.userUsage.get(userId);
    return userCoupons.get(couponCode) || 0;
  }

  /**
   * Increment usage count for a user and coupon
   * @param {string} userId - User ID
   * @param {string} couponCode - Coupon code
   */
  incrementUsage(userId, couponCode) {
    if (!this.userUsage.has(userId)) {
      this.userUsage.set(userId, new Map());
    }
    const userCoupons = this.userUsage.get(userId);
    const currentCount = userCoupons.get(couponCode) || 0;
    userCoupons.set(couponCode, currentCount + 1);
  }

  /**
   * Initialize seed data with demo coupons
   */
  initializeSeedData() {
    const seedCoupons = [
      {
        code: 'WELCOME100',
        description: 'Welcome offer - Flat ₹100 off for new users',
        discountType: 'FLAT',
        discountValue: 100,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        eligibility: {
          firstOrderOnly: true,
          minCartValue: 500
        }
      },
      {
        code: 'SAVE20',
        description: '20% off on all orders',
        discountType: 'PERCENT',
        discountValue: 20,
        maxDiscountAmount: 500,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        eligibility: {
          minCartValue: 1000
        }
      },
      {
        code: 'GOLD50',
        description: 'Exclusive ₹50 off for GOLD tier users',
        discountType: 'FLAT',
        discountValue: 50,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        eligibility: {
          allowedUserTiers: ['GOLD'],
          minCartValue: 300
        }
      },
      {
        code: 'FASHION15',
        description: '15% off on fashion items',
        discountType: 'PERCENT',
        discountValue: 15,
        maxDiscountAmount: 300,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        eligibility: {
          applicableCategories: ['fashion'],
          minCartValue: 500
        }
      },
      {
        code: 'ELECTRONICS200',
        description: '₹200 off on electronics',
        discountType: 'FLAT',
        discountValue: 200,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        eligibility: {
          applicableCategories: ['electronics'],
          minCartValue: 2000
        }
      },
      {
        code: 'LOYAL25',
        description: '25% off for loyal customers',
        discountType: 'PERCENT',
        discountValue: 25,
        maxDiscountAmount: 1000,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        eligibility: {
          minLifetimeSpend: 5000,
          minOrdersPlaced: 5
        }
      },
      {
        code: 'INDIA10',
        description: '10% off for Indian customers',
        discountType: 'PERCENT',
        discountValue: 10,
        maxDiscountAmount: 200,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        eligibility: {
          allowedCountries: ['IN'],
          minCartValue: 500
        }
      }
    ];

    seedCoupons.forEach(coupon => {
      this.coupons.set(coupon.code, coupon);
    });

    console.log(`✅ Initialized ${seedCoupons.length} seed coupons`);
  }
}

// Export singleton instance
export default new CouponStore();
