const Razorpay=require('razorpay');
const Order=require('../models/order');
const UserController = require('./user');

const dotenv = require("dotenv")
dotenv.config()



const purchasepremium = async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount = 2500 // in paise

        const order = await rzp.orders.create({ amount, currency: "INR" });

        await req.user.createOrder({ orderid: order.id, status: 'PENDING' })
        return res.status(201).json({ order, key_id: rzp.key_id })

    } catch (err) {
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err })
    }
}
 const updateTransactionStatus=async(req,res)=>{
   try{
    console.log("hi")
    const userId=req.user.id;
    const{order_id,  payment_id}=req.body;
    const order=await Order.findOne({where:{orderid:order_id}})
    const promise1=order.update({paymentid:payment_id, status:"successful"})
    const promise2=req.user.update({ispremiumuser:true})
    console.log(order);
   

    Promise.all([promise1,promise2]).then(()=>{
        
        return res.status(202).json({success:true,message:"transaction successful",token: UserController.generateAccessToken(userId,undefined , true) });
    })
     .catch((error)=>{
        throw new Error(error)
     })
        
}      
  catch(err)
 {
    res.status(403).json({error:err,message:"something went wrong"});  
 }
 }
 module.exports={
    purchasepremium,
    updateTransactionStatus
 }

