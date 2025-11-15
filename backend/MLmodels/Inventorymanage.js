const mongoose = require('mongoose');

const ProductInventoryAnalyticsSchema = new mongoose.Schema({
    productCode: { type: String, required: true },
    BuisnessCode: { type: String, required: true },
    OrganisationCode: { type: String, required: true },

    // Sales & inventory metrics
    totalQuantitySold: { type: Number, default: 0 },
    totalRevenueGenerated: { type: Number, default: 0 },
    averageDailySales: { type: Number, default: 0 },
    lastSoldDate: { type: String },
    currentStock: { type: Number, default: 0 },
    daysOfStockLeft: { type: Number, default: 0 }, // currentStock / avgDailySales

    restockRecommendation: { type: Boolean, default: false },

    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductInventoryAnalytics', ProductInventoryAnalyticsSchema);
