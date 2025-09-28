const productInv = require('../MLmodels/Inventorymanage');

const Sales  = require('../MODELS/SalesSchema');
const Product = require('../MODELS/Products');

async function updateProductInventoryAnalysis(BuisnessCode,productCode) {
    const product = await Product.find({BuisnessCode,productcode:productCode});
    const sales  = await Sales.find({BuisnessCode,productCode});
    const totalQuantitySold = sales.reduce((sum,s)=>sum+s.quantity,0);
    const totalRevenueGenerated = sales.reduce((sum,s)=>sum+s.totalCost,0);
    const daySinceFirstSale = sales.length?(Date.now()-new Date(sales[0].date).getTime())/(1000*60*60*24):1;
    const averageDailySales = totalQuantitySold/daySinceFirstSale;
    const currentStock = product.quantity;
    const daysOfStockLeft = averageDailySales>0?currentStock/averageDailySales:0
    const restockRecommendation = daysOfStockLeft<5;

    await productInv.findOneAndUpdate({
        BuisnessCode,productCode
    },
    {
        totalQuantitySold,
        totalRevenueGenerated,
        averageDailySales,
        lastSoldDate:sales.length?sales[sales.length-1].date:null,
        currentStock,
        daysOfStockLeft,
        restockRecommendation,
        lastUpdated: new Date()
    },
    {upsert:true,new:true}
);
}
module.exports = updateProductInventoryAnalysis