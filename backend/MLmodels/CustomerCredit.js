const mongoose = require('mongoose');

const CustomerCreditAnalyticsSchema = new mongoose.Schema({
    phoneNumber: { type: Number, required: true },
    BuisnessCode: { type: String, required: true },

    // Credit metrics
    totalCreditsIssued: { type: Number, default: 0 },
    totalCreditsPaid: { type: Number, default: 0 },
    totalCreditsOutstanding: { type: Number, default: 0 },
    numberOfCredits: { type: Number, default: 0 },
    fullySettledCount: { type: Number, default: 0 },
    partiallyPaidCount: { type: Number, default: 0 },

    // Behavioral features
    daysSinceLastCreditIssued: { type: Number, default: 0 },
    averageCreditAmount: { type: Number, default: 0 },
    maxCreditAmount: { type: Number, default: 0 },
    minCreditAmount: { type: Number, default: 0 },
    creditDefaultFlag: { type: Boolean, default: false }, // can be labeled from history

    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CustomerCreditAnalytics', CustomerCreditAnalyticsSchema);
