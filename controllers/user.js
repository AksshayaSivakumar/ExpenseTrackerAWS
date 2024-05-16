const path=require('path');
const sequelize = require("../util/database");
const Sequelize = require('sequelize')
const User=require('../models/user');
const rootDir=require('../util/path');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

function isStringInvalid(string) {
  return string === undefined || string.length === 0;
}

const signUp=async(req, res) =>{
    res.sendFile(path.join(rootDir,'public','signup.html'));
  }

  const login=async(req, res) =>{
    res.sendFile(path.join(rootDir,'public','login.html'));
  }

  
  const submitUser=async(req,res)=>{
    
    try {
      const { name, email, password } = req.body;
      console.log({ name, email, password })
      if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password)) {
        return res.status(400).json({ err: "Bad parameters. Something is missing" });
      }
        const saltrounds=10;
        bcrypt.genSalt(saltrounds,async(err,salt)=>{
        bcrypt.hash(password,salt,async(err,hash)=>{
        await User.create({ name, email, password:hash })
        res.status(201).json({ message: "Signup successful" })
        })
      }) 
      }
      // Create the user  
    catch(err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

 function generateAccessToken(id,name,ispremiumuser)
  {
    return jwt.sign({userId:id, name:name, ispremiumuser},'secretkey');
  }

  const loginPage=async(req,res)=>{
    try{
      const { email, password } = req.body;
      if (isStringInvalid(email) || isStringInvalid(password)) {
        return res.status(400).json({ message: "emailid or password is missing", success:false});
      }
      
      const user=await User.findAll({where:{email}})
      if(user.length>0)
      
      {
        bcrypt.compare(password,user[0].password,(err,result)=>{
          if(err)
          {
            throw new Error('something went wrong');
          }
          if(result){
           //console.log(user)
          return res.status(201).json({ success:true,message: "user logged in successfully", token:generateAccessToken(user[0].id,user[0].name,user[0].ispremiumuser) });
        }
        else{
          return res.status(401).json({success:false, message: "password incorrect" });
        }
        })
      }
      else{
          return res.status(404).json({success:false, message: "user not found" })  

      }  
        }
        
    catch(err){
      console.error(err);
      res.status(500).json({ message:err,success:false});
    }
  }

  module.exports={
    isStringInvalid,
    signUp,
    login,
    submitUser,
    generateAccessToken,
    loginPage

  }
  


