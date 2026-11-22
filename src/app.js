import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import couponRoutes from './routes/couponRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Coupon Management System API',
        version: '1.0.0',
        endpoints: {
            createCoupon: 'POST /api/coupons',
            getAllCoupons: 'GET /api/coupons',
            getBestCoupon: 'POST /api/coupons/best'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Mount routes
app.use('/api', couponRoutes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
