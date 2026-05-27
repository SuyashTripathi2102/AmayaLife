require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const userCategoriesRoutes = require('./routes/categorieRoutes');
const userProductsRoutes = require('./routes/productRoutes');
const imageRoutes = require('./routes/imageRoutes');
const errorHandler = require('./middlewares/errorHandler');
const {apiLimiter} = require('./middlewares/rateLimiter');
const cors = require('cors');
const helmet = require('helmet');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const otpRoutes = require('./routes/otpRoutes');

require('./cron/cronJobs');


const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
};
app.use(helmet());
app.use(cors(corsOptions));
app.use(apiLimiter);

app.use(express.json());
app.use(cookieParser());

app.use('/api/users',userRoutes);
app.use('/api',userCategoriesRoutes);
app.use('/api',userProductsRoutes);
app.use('/api',imageRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api/users', otpRoutes);





app.use(errorHandler);

const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`SERVER IS LISTENING ON ${PORT}`);
})