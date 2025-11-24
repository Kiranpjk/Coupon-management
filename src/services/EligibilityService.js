/**
 * Service to evaluate coupon eligibility based on user and cart attributes
 */

export class EligibilityService {
    /**
     * Check if a coupon is eligible for the given user and cart
     * @param {Object} coupon - Coupon to check
     * @param {Object} user - User context
     * @param {Object} cart - Shopping cart
     * @returns {boolean} True if eligible
     */
    static isEligible(coupon, user, cart) {
        // Check validity period
        if (!this.isWithinValidityPeriod(coupon.startDate, coupon.endDate)) {
            return false;
        }

        // Check user eligibility
        if (!this.checkUserEligibility(coupon.eligibility || {}, user)) {
            return false;
        }

        // Check cart eligibility
        if (!this.checkCartEligibility(coupon.eligibility || {}, cart)) {
            return false;
        }

        return true;
    }

    /**
     * Check if current date is within coupon validity period
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {boolean} True if valid
     */
    static isWithinValidityPeriod(startDate, endDate) {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Set time to end of day for endDate
        end.setHours(23, 59, 59, 999);

        return now >= start && now <= end;
    }

    /**
     * Check user-based eligibility criteria
     * @param {Object} eligibility - Eligibility rules
     * @param {Object} user - User context
     * @returns {boolean} True if eligible
     */
    static checkUserEligibility(eligibility, user) {
        // Check allowedUserTiers
        if (eligibility.allowedUserTiers && eligibility.allowedUserTiers.length > 0) {
            if (!eligibility.allowedUserTiers.includes(user.userTier)) {
                return false;
            }
        }

        // Check minLifetimeSpend
        if (eligibility.minLifetimeSpend !== undefined) {
            if (user.lifetimeSpend < eligibility.minLifetimeSpend) {
                return false;
            }
        }

        // Check minOrdersPlaced
        if (eligibility.minOrdersPlaced !== undefined) {
            if (user.ordersPlaced < eligibility.minOrdersPlaced) {
                return false;
            }
        }

        // Check firstOrderOnly
        if (eligibility.firstOrderOnly === true) {
            if (user.ordersPlaced > 0) {
                return false;
            }
        }

        // Check allowedCountries
        if (eligibility.allowedCountries && eligibility.allowedCountries.length > 0) {
            if (!eligibility.allowedCountries.includes(user.country)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check cart-based eligibility criteria
     * @param {Object} eligibility - Eligibility rules
     * @param {Object} cart - Shopping cart
     * @returns {boolean} True if eligible
     */
    static checkCartEligibility(eligibility, cart) {
        const cartValue = this.calculateCartValue(cart);
        const cartCategories = this.getCartCategories(cart);
        const totalItems = this.getTotalItemsCount(cart);

        // Check minCartValue
        if (eligibility.minCartValue !== undefined) {
            if (cartValue < eligibility.minCartValue) {
                return false;
            }
        }

        // Check applicableCategories
        if (eligibility.applicableCategories && eligibility.applicableCategories.length > 0) {
            const hasApplicableCategory = eligibility.applicableCategories.some(cat =>
                cartCategories.includes(cat)
            );
            if (!hasApplicableCategory) {
                return false;
            }
        }

        // Check excludedCategories
        if (eligibility.excludedCategories && eligibility.excludedCategories.length > 0) {
            const hasExcludedCategory = eligibility.excludedCategories.some(cat =>
                cartCategories.includes(cat)
            );
            if (hasExcludedCategory) {
                return false;
            }
        }

        // Check minItemsCount
        if (eligibility.minItemsCount !== undefined) {
            if (totalItems < eligibility.minItemsCount) {
                return false;
            }
        }

        return true;
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

    /**
     * Get unique categories in cart
     * @param {Object} cart - Shopping cart
     * @returns {Array} Array of unique categories
     */
    static getCartCategories(cart) {
        return [...new Set(cart.items.map(item => item.category))];
    }

    /**
     * Get total number of items in cart
     * @param {Object} cart - Shopping cart
     * @returns {number} Total items count
     */
    static getTotalItemsCount(cart) {
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    }
}
