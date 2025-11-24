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
    if (coupon.discountType === 'FLAT') {
      return coupon.discountValue;
    } else if (coupon.discountType === 'PERCENT') {
      let discount = (cartValue * coupon.discountValue) / 100;
      
      // Apply max discount cap if specified
      if (coupon.maxDiscountAmount !== undefined) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
      
      return discount;
    }
    
    return 0;
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
