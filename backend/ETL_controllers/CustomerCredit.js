const CustomerCreditAnalytics = require('../MLmodels/CustomerCredit');
const Credits = require('../MODELS/CreditSchema');

function parseDateString(dateStr) {
  if (!dateStr) return null;
 const [day, month, year] = dateStr.split(/[\/-]/).map(Number);

  return new Date(year, month - 1, day);
}

async function updateCustomerCreditAnalysis(phoneNumber, BuisnessCode) {
  try {
    const creditData = await Credits.find({ phoneNumber, BuisnessCode });

    if (!creditData || creditData.length === 0) {
      console.log(`No credit records found for ${phoneNumber} under ${BuisnessCode}`);
      return;
    }

    const totalCreditsIssued = creditData.reduce((sum, c) => sum + (c.totalCost || 0), 0);
    const totalCreditPaid = creditData
      .filter(c => c.status === 'settled')
      .reduce((sum, c) => sum + (c.totalCost || 0), 0);
    const totalCreditsOutstanding = totalCreditsIssued - totalCreditPaid;

    const fullySettledCount = creditData.filter(c => c.status === 'settled').length;
    const partiallyPaidCount = creditData.filter(c => c.status === 'partially-paid').length;
    const unpaidCount = creditData.filter(c => c.status === 'unpaid').length;

    const numberOfCredits = creditData.length;

    // find last issued date
    const issuedDates = creditData
      .map(c => parseDateString(c.issued))
      .filter(Boolean)
      .sort((a, b) => b - a);

    const lastCreditDate = issuedDates.length ? issuedDates[0] : null;
    const daysSinceLastCreditIssued = lastCreditDate
      ? Math.floor((Date.now() - lastCreditDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    await CustomerCreditAnalytics.findOneAndUpdate(
      { phoneNumber, BuisnessCode },
      {
        totalCreditsIssued,
        totalCreditPaid,
        totalCreditsOutstanding,
        numberOfCredits,
        fullySettledCount,
        partiallyPaidCount,
        unpaidCount,
        daysSinceLastCreditIssued,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Credit analytics updated for ${phoneNumber} (${BuisnessCode})`);
  } catch (err) {
    console.error('❌ Failed to update credit analytics:', err.message);
  }
}

module.exports = updateCustomerCreditAnalysis;
