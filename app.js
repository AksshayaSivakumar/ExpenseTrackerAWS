
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();




const userRoutes = require('./routes/userRoute');
const expenseRoutes = require('./routes/expenseRoute')
const purchaseRoutes = require('./routes/purchase')
const premiumFeatureRoutes = require('./routes/premiumFeatureRoute')
const forgotPasswordRoute=require('./routes/forgotPasswordRoute')


const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const  Forgotpassword = require('./models/forgotpassword');


             
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());


// Use your user routes


app.use('/user', userRoutes);
app.use('/expense',expenseRoutes);
app.use('/purchase',purchaseRoutes);
app.use('/premium',premiumFeatureRoutes);
app.use('/password',forgotPasswordRoute);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(3004, () => {
            console.log('Server is running on port 3004');
        });
    })
    .catch(err => {
        console.log(err);
    });