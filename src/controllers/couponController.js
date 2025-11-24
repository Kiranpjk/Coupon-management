import couponStore from '../services/CouponStore.js';
import { BestCouponService } from '../services/BestCouponService.js';

/**
 * Controller for coupon-related operations
 */

/**
 * Create a new coupon
 * POST /api/coupons
 */
export const createCoupon = (req, res) => {
    try {
        const couponData = req.body;

        // Validate required fields
        if (!couponData.code || !couponData.description || !couponData.discountType ||
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
