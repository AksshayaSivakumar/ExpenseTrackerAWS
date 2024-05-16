const sequelize = require("../util/database");
const Sequelize = require('sequelize');
const User=require('../models/user');
const Expense=require('../models/expense');

const getUserLeaderBoard=async(req,res)=>{
    try{
        const leaderboardofusers=await User.findAll({
            
            order:[['totalexpense','DESC']]
        })
        res.status(200).json(leaderboardofusers)

    }
    catch(err){
       console.log(err)
       res.status(500).json(err)
    }
}
module.exports={
    getUserLeaderBoard
    
}