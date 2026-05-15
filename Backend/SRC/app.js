require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const userCategories = require('./routes/categorieRoutes');
const userProducts = require('./routes/productRoutes');
const app = express();
app.use(express.json());

app.use('/api/users',userRoutes);
app.use('/api',userCategories);
app.use('/api',userProducts);
const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`SERVER IS LISTENING ON ${PORT}`);
})