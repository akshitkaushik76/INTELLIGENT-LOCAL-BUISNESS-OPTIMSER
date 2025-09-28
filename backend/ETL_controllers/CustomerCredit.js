const CustomerCreditAnalytics = require('../MLmodels/CustomerCredit')

const Credits = require('../MODELS/CreditSchema');

async function updateCustomerCreditAnalysis(phoneNumber,BuisnessCode) {
     const creditData = await Credits.find({phoneNumber,BuisnessCode});
     const totalCreditsIssued = creditData.reduce((sum,c)=>sum+c.totalCost,0)
     const totalCreditPaid = creditData.reduce((sum,c)=>{
        return c.status === 'settled'?sum+c.totalCost:sum;
     },0);
     const totalCreditsOutstanding = creditData.reduce((sum,c)=>{
        return c.status !== 'settled'?sum+c.totalCost:sum;
     })
     const fullySettledCount = creditData.filter(c=>c.status === 'settled').length;
     const partiallyPaidCount = creditData.filter(c=>c.status !== 'settled').length;
     const numberOfCredits = creditData.length;
     const lastCreditDate = creditData.length?new Date(creditData[creditData-1].totalCreditsIssued):null;

     const daysSinceLastCreditIssued = lastCreditDate?Math.floor((Date.now()-lastCreditDate.getTime())/(1000*60*60*24)):0;
     await CustomerCreditAnalytics.findOneAndUpdate({
        phoneNumber,BuisnessCode
     },
     {
        totalCreditsIssued,
        totalCreditPaid,
        totalCreditsOutstanding,
        numberOfCredits,
        fullySettledCount,
        partiallyPaidCount,
        daysSinceLastCreditIssued,
        lastUpdated: new Date()
     },
     {upsert:true,new:true}
    );
}
module.exports = updateCustomerCreditAnalysis;