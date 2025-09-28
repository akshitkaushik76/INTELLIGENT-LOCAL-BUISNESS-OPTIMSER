const mongoose = require('mongoose');

const ProductRecommendationAnalyticsSchema = new mongoose.Schema({
    BuisnessCode: { type: String, required: true },
    OrganisationCode: { type: String, required: true },
    productCode: { type: String, required: true },
    productName: { type: String },

    // Sales metrics
    totalQuantitySold: { type: Number, default: 0 },
    totalRevenueGenerated: { type: Number, default: 0 },
    averageDailySales: { type: Number, default: 0 },
    trendScore: { type: Number, default: 0 }, // higher → popular product
    recommendedStock: { type: Number, default: 0 },

    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductRecommendationAnalytics', ProductRecommendationAnalyticsSchema);
