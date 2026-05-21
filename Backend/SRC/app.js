require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const userCategoriesRoutes = require('./routes/categorieRoutes');
const userProductsRoutes = require('./routes/productRoutes');
const imageRoutes = require('./routes/imageRoutes');
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/users',userRoutes);
app.use('/api',userCategoriesRoutes);
app.use('/api',userProductsRoutes);
app.use('/api',imageRoutes);


const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`SERVER IS LISTENING ON ${PORT}`);
})