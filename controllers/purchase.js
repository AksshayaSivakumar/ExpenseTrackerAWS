const dotenv = require("dotenv");
const mongoose = require('mongoose');
const Order = require('../models/order');
const UserController = require('./user');

dotenv.config();

const purchasepremium = async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const amount = 2500; // in paise

        const order = await rzp.orders.create({ amount, currency: "INR" });

        const newOrder = new Order({ orderid: order.id, status: 'PENDING', userId: req.user._id });
        await newOrder.save();
        
        return res.status(201).json({ order, key_id: rzp.key_id });

    } catch (err) {
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err });
    }
};

const updateTransactionStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const { order_id, payment_id } = req.body;

        const order = await Order.findOne({ orderid: order_id });

        const promise1 = order.updateOne({ paymentid: payment_id, status: "successful" });
        const promise2 = User.updateOne({ _id: req.user._id }, { ispremiumuser: true });

        await Promise.all([promise1, promise2]);

        return res.status(202).json({
            success: true,
            message: "transaction successful",
            token: UserController.generateAccessToken(userId, undefined, true)
        });

    } catch (err) {
        res.status(403).json({ error: err, message: "something went wrong" });
    }
};

module.exports = {
    purchasepremium,
    updateTransactionStatus
};