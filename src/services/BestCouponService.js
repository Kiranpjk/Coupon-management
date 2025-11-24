import { EligibilityService } from './EligibilityService.js';
import { DiscountService } from './DiscountService.js';

/**
 * Service to find the best applicable coupon for a user and cart
 */

export class BestCouponService {
  /**
   * Find the best coupon for a user and cart
   * @param {Object} user - User context
   * @param {Object} cart - Shopping cart
   * @param {Object} store - CouponStore instance
   * @returns {Object|null} Best coupon with discount details or null
   */
  static findBestCoupon(user, cart, store) {
    const allCoupons = store.getAllCoupons();
    const cartValue = DiscountService.calculateCartValue(cart);
    
    // Filter eligible coupons
    const eligibleCoupons = allCoupons.filter(coupon => {
      // Check usage limit
      if (coupon.usageLimitPerUser !== undefined) {
        const usageCount = store.getUserUsageCount(user.userId, coupon.code);
        if (usageCount >= coupon.usageLimitPerUser) {
          return false;
        }
      }
      
      // Check eligibility rules
      return EligibilityService.isEligible(coupon, user, cart);
    });

    if (eligibleCoupons.length === 0) {
      return null;
    }

    // Calculate discount for each eligible coupon
    const couponsWithDiscount = eligibleCoupons.map(coupon => {
      const discount = DiscountService.calculateDiscount(coupon, cartValue);
      return {
        coupon,
        discount,
        finalPrice: cartValue - discount
      };
    });

    // Sort by best discount using tie-breaking rules:
    // 1. Highest discount amount
    // 2. Earliest end date
    // 3. Lexicographically smaller code
    couponsWithDiscount.sort((a, b) => {
      // Rule 1: Highest discount
      if (b.discount !== a.discount) {
        return b.discount - a.discount;
      }
      
      // Rule 2: Earliest end date
      const endDateA = new Date(a.coupon.endDate);
      const endDateB = new Date(b.coupon.endDate);
      if (endDateA.getTime() !== endDateB.getTime()) {
        return endDateA - endDateB;
      }
      
      // Rule 3: Lexicographically smaller code
      return a.coupon.code.localeCompare(b.coupon.code);
    });

    // Return the best coupon
    const best = couponsWithDiscount[0];
    return {
      coupon: best.coupon,
      discountAmount: best.discount,
      originalPrice: cartValue,
      finalPrice: best.finalPrice
    };
  }
}
