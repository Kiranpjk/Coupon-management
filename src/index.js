import app from './app.js';

const PORT = process.env.PORT || 5000;

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
