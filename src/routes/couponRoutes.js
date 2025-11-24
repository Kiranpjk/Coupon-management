import express from 'express';
import { createCoupon, getAllCoupons, getBestCoupon } from '../controllers/couponController.js';

const router = express.Router();

/**
 * POST /api/coupons
 * Create a new coupon
 */
router.post('/coupons', createCoupon);

/**
 * GET /api/coupons
 * Get all coupons
 */
router.get('/coupons', getAllCoupons);

/**
 * POST /api/coupons/best
 * Get the best matching coupon for a user and cart
 */
router.post('/coupons/best', getBestCoupon);

export default router;
