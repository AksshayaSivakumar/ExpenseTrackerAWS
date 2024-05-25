
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const sequelize = require('./util/database'); 



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




User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User)

sequelize
.sync()
//.sync({force:true})
    .then(() => {
        app.listen(3004);
    })
    .catch(err => {
        console.log(err);
    })