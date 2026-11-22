/**
 * Service to calculate discount amounts
 */

export class DiscountService {
  /**
   * Calculate discount amount for a coupon
   * @param {Object} coupon - Coupon object
   * @param {number} cartValue - Total cart value
   * @returns {number} Discount amount
   */
  static calculateDiscount(coupon, cartValue) {
    let discount = 0;
    if (coupon.discountType === 'FLAT') {
      discount = coupon.discountValue;
    } else if (coupon.discountType === 'PERCENT') {
      discount = (cartValue * coupon.discountValue) / 100;

      // Apply max discount cap if specified (null means "no cap")
      if (coupon.maxDiscountAmount != null) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    }

    // A discount can never exceed the cart value (no negative final prices);
    // round to 2 decimals to avoid floating point noise like 149.99850000000001
    discount = Math.max(0, Math.min(discount, cartValue));
    return Math.round(discount * 100) / 100;
  }

  /**
   * Calculate total cart value
   * @param {Object} cart - Shopping cart
   * @returns {number} Total value
   */
  static calculateCartValue(cart) {
    return cart.items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);
  }
}
