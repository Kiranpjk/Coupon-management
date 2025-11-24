import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import couponRoutes from './routes/couponRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API Base: http://localhost:${PORT}/api`);
    console.log(`\n✨ Available endpoints:`);
    console.log(`   POST   /api/coupons       - Create coupon`);
    console.log(`   GET    /api/coupons       - List all coupons`);
    console.log(`   POST   /api/coupons/best  - Get best coupon\n`);
});

export default app;
