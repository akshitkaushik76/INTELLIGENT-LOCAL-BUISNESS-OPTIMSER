const Sales  = require('../MODELS/SalesSchema');
const Product = require('../MODELS/Products');
const computeSaletime = ()=>{
  
          const now = new Date();
          const hour = now.getHours().toString().padStart(2,'0');
          const min = now.getMinutes().toString().padStart(2,'0');
          const sec = now.getSeconds().toString().padStart(2,'0');
          return `${hour}:${min}:${sec}`;
        
}
const computeSaleDate = ()=>{
  const now = new Date();
  const date = now.getDate().toString().padStart(2,'0');
  const month = (now.getMonth()+1).toString().padStart(2,'0');
  const year = now.getFullYear().toString().padStart(2,'0');
  return `${date}/${month}/${year}`;
}


exports.CreateSale = async(req,res,next)=>{
    try{
        const OrganisationCode = req.params.OrganisationCode;
        const BuisnessCode = req.params.BuisnessCode;
        const {productCode,quantity} = req.body;
        const product = await Product.findOne({BuisnessCode:BuisnessCode,productcode:productCode});
        if(!product) {
            return res.status(404).json({
                status:'fail',
                message:'the product is not registered'
            })
        }
        if(product.quantity<quantity) {
            return res.status(403).json({
                status:'fail',
                message:'the quantity of product is not enough'
            })
        }
        const totalAmount = product.sellingPrice*quantity;
        const sales = await Sales.create({
            OrganisationCode:OrganisationCode,
            BuisnessCode:BuisnessCode,
            productCode:productCode,
            quantity:quantity,
            totalCost:totalAmount,
            date:computeSaleDate(),
            time:computeSaletime()
        })
        product.quantity = product.quantity-quantity
        await product.save();
        res.status(200).json({
            status:'success',
            data:sales
        })
    }catch(error) {
        res.status(500).json({
            status:'failure',
            error:error.message
        })
    }
}