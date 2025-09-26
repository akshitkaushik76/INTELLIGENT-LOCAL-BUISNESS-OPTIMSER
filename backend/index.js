require('dotenv').config({path:'./config.env'});
const express = require('express');
const app = express();
const OwnerRouter = require('./ROUTES/OwnerRoutes');
const CustomerRouter = require('./ROUTES/CustomerRoutes');
const CreditRouter = require('./ROUTES/CreditRouter');
const ProductRouter = require('./ROUTES/ProductRouter');
const salesRouter = require('./ROUTES/SalesRouter');
const mongoose = require('mongoose');
// const { applyTimestamps } = require('./MODELS/Owner');
console.log(process.env.PORT);
app.use(express.json());
app.use('/ilba',OwnerRouter);
app.use('/ilba',CustomerRouter);
app.use('/ilba/',CreditRouter);
app.use('/ilba',ProductRouter);
app.use('/ilba',salesRouter);
mongoose.connect(process.env.CONNECTION_STRING,{
}).then(()=>{
    console.log('connected to the database through port ',process.env.PORT);
}).catch((err)=>{
    console.log('error occurred ',err.message);
})

app.listen(process.env.PORT,()=>console.log('server running at port ',process.env.CONNECTION_STRING))

