require('dotenv').config({path:'./config.env'});
const express = require('express');
const app = express();
const OwnerRouter = require('./ROUTES/OwnerRoutes');
const mongoose = require('mongoose');
const { applyTimestamps } = require('./MODELS/Owner');
console.log(process.env.PORT);
app.use(express.json());
app.use('/ilba',OwnerRouter);
mongoose.connect(process.env.CONNECTION_STRING,{
}).then(()=>{
    console.log('connected to the database through port ',process.env.PORT);
}).catch((err)=>{
    console.log('error occurred ',err.message);
})

app.listen(process.env.PORT,()=>console.log('server running at port ',process.env.CONNECTION_STRING))

