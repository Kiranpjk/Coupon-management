import couponStore from '../services/CouponStore.js';
import { BestCouponService } from '../services/BestCouponService.js';

/**
 * Controller for coupon-related operations
 */

const isNonNegativeNumber = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isValidDate = (v) => typeof v === 'string' && !Number.isNaN(new Date(v).getTime());
const isOptionalNonNegativeNumber = (v) => v === undefined || v === null || isNonNegativeNumber(v);

/**
 * Returns an error message for invalid coupon numbers/dates, or null if valid.
 */
const validateCouponValues = (c) => {
    if (typeof c.code !== 'string' || c.code.trim() === '') return 'code must be a non-empty string';
    if (!isNonNegativeNumber(c.discountValue)) return 'discountValue must be a non-negative number';
    if (c.discountType === 'PERCENT' && c.discountValue > 100) return 'discountValue for PERCENT coupons must be <= 100';
    if (!isOptionalNonNegativeNumber(c.maxDiscountAmount)) return 'maxDiscountAmount must be a non-negative number';
    if (!isOptionalNonNegativeNumber(c.usageLimitPerUser)) return 'usageLimitPerUser must be a non-negative number';
    if (!isValidDate(c.startDate) || !isValidDate(c.endDate)) return 'startDate and endDate must be valid dates (YYYY-MM-DD)';
    if (new Date(c.startDate) > new Date(c.endDate)) return 'startDate must be on or before endDate';
    if (c.eligibility !== undefined && (typeof c.eligibility !== 'object' || c.eligibility === null || Array.isArray(c.eligibility))) {
        return 'eligibility must be an object';
    }
    return null;
};

/**
 * Returns an error message for invalid cart items, or null if valid.
 */
const validateCartItems = (items) => {
    for (const [i, item] of items.entries()) {
        if (!item || typeof item !== 'object') return `cart.items[${i}] must be an object`;
        if (!isNonNegativeNumber(item.unitPrice)) return `cart.items[${i}].unitPrice must be a non-negative number`;
        if (!Number.isInteger(item.quantity) || item.quantity < 0) return `cart.items[${i}].quantity must be a non-negative integer`;
    }
    return null;
};

/**
 * Create a new coupon
 * POST /api/coupons
 */
export const createCoupon = (req, res) => {
    try {
        const couponData = req.body;

        // Validate required fields
        if (!couponData || typeof couponData !== 'object' || !couponData.code || !couponData.description || !couponData.discountType ||
            couponData.discountValue === undefined || !couponData.startDate || !couponData.endDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: code, description, discountType, discountValue, startDate, endDate'
            });
        }

        // Validate discountType
        if (!['FLAT', 'PERCENT'].includes(couponData.discountType)) {
            return res.status(400).json({
                success: false,
                error: 'discountType must be either FLAT or PERCENT'
            });
        }

        const valueError = validateCouponValues(couponData);
        if (valueError) {
            return res.status(400).json({ success: false, error: valueError });
        }

        // Add the coupon
        const coupon = couponStore.addCoupon(couponData);

        res.status(201).json({
            success: true,
            data: coupon,
            message: 'Coupon created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get all coupons
 * GET /api/coupons
 */
export const getAllCoupons = (req, res) => {
    try {
        const coupons = couponStore.getAllCoupons();

        res.status(200).json({
            success: true,
            data: coupons,
            count: coupons.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get best matching coupon for user and cart
 * POST /api/coupons/best
 */
export const getBestCoupon = (req, res) => {
    try {
        const { user, cart } = req.body;

        // Validate required fields
        if (!user || !cart) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: user and cart'
            });
        }

        if (!user.userId) {
            return res.status(400).json({
                success: false,
                error: 'user.userId is required'
            });
        }

        if (!cart.items || !Array.isArray(cart.items)) {
            return res.status(400).json({
                success: false,
                error: 'cart.items must be an array'
            });
        }

        const itemsError = validateCartItems(cart.items);
        if (itemsError) {
            return res.status(400).json({ success: false, error: itemsError });
        }

        // Find best coupon
        const result = BestCouponService.findBestCoupon(user, cart, couponStore);

        if (result === null) {
            return res.status(200).json({
                success: true,
                data: null,
                message: 'No eligible coupon found for this user and cart'
            });
        }

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
