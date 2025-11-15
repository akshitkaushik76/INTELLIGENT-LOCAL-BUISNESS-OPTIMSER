const productInv = require('../MLmodels/Inventorymanage');
const Sales = require('../MODELS/SalesSchema');
const Product = require('../MODELS/Products');

function parseDateString(dateStr) {
  // Converts "dd/mm/yyyy" → Date object
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

async function updateProductInventoryAnalysis(OrganisationCode,BuisnessCode, productCode) {
  try {
    const product = await Product.findOne({ BuisnessCode,productcode:productCode });
    const sales = await Sales.find({ BuisnessCode, productCode });

    if (!product || sales.length === 0) {
      console.log('No matching product or sales found for ETL update');
      return;
    }

    const totalQuantitySold = sales.reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenueGenerated = sales.reduce((sum, s) => sum + s.totalCost, 0);

    // Convert first sale date (string) to Date object
    const firstSaleDate = parseDateString(sales[0].date);
    const daySinceFirstSale = (Date.now() - firstSaleDate.getTime()) / (1000 * 60 * 60 * 24) || 1;
    const averageDailySales = totalQuantitySold / daySinceFirstSale;

    const currentStock = product.quantity;
    const daysOfStockLeft = averageDailySales > 0 ? currentStock / averageDailySales : 0;
    const restockRecommendation = daysOfStockLeft < 5;

    await productInv.findOneAndUpdate(
        
        { OrganisationCode,BuisnessCode, productCode },
      {
        totalQuantitySold,
        totalRevenueGenerated,
        averageDailySales,
        lastSoldDate: sales[sales.length - 1].date || null,
        currentStock,
        daysOfStockLeft,
        restockRecommendation,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log(`✅ ETL updated for Product: ${productCode}`);
  } catch (err) {
    console.error('❌ ETL update failed:', err.message);
  }
}

module.exports = updateProductInventoryAnalysis;
