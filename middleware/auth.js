const jwt=require('jsonwebtoken');
const User=require('../models/user');
const Expense=require('../models/expense');

const authenticate=(req,res,next)=>{
    try{
        const token=req.header('Authorization');
        const user=jwt.verify(token,'secretkey');
        console.log('userId>>>>>', user.userId)

        

        User.findByPk(user.userId).then(user=>{
            req.user=user;
            console.log(req.user)
            next();
            
        })
        .catch(err=>{
            throw new Error(err)
        })

       
    }
    catch(err)
    {
        return res.status(401).json({success:false})
    }
}
module.exports={
    authenticate
}