const mongoose = require('mongoose');

const BusinessSalesAnalyticsSchema = new mongoose.Schema({
    BuisnessCode: { type: String, required: true },
    OrganisationCode: { type: String, required: true },

    
    totalSales: { type: Number, default: 0 },
    totalCreditsIssued: { type: Number, default: 0 },
    totalCreditsSettled: { type: Number, default: 0 },
    numberOfProductsSold: { type: Number, default: 0 },
    averageSaleValue: { type: Number, default: 0 },

    
    monthlySalesTrend: [{ month: String, revenue: Number }],
    weeklySalesTrend: [{ week: String, revenue: Number }],

    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BusinessSalesAnalytics', BusinessSalesAnalyticsSchema);
