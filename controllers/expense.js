const path=require('path');
const sequelize = require("../util/database");
const Expense=require('../models/expense');
const User=require('../models/user');
const rootDir=require('../util/path');
const S3Services=require('../services/s3services');
const UserServices=require('../services/userservices');


const Index=async(req, res) =>{
    res.sendFile(path.join(rootDir,'public','index.html'));
  }

  const submitExpense=async(req,res)=>{
    
    const t=await sequelize.transaction();

    try{
    const { expenseamount, description, category } = req.body;
    //console.log(expenseamount)
    if(expenseamount==undefined||expenseamount.length==0)
    {
      return res.status(400).json({success:false,message:"some parameters missing"})
    }
   
    const expense=await Expense.create({ expenseamount, description, category, userId:req.user.id},{transaction:t})
      const totalexpense=Number(req.user.totalexpense)+Number(expenseamount)
      console.log(totalexpense)
      await User.update({totalexpense:totalexpense
      },{
        where:{id:req.user.id},
         transaction:t
        })
           console.log(expense)
          await t.commit();
          res.status(201).json({success:true,expense:expense})
        
      }
    catch(err){
      await t.rollback();
      res.status(500).json({success:false,error:err})
    }
        
 }

        const getExpense=async(req,res)=>{
          try {

            const check =req.user.ispremiumuser;
            const page= parseInt(req.query.page)||1;
            console.log(page);
            const pageSize= parseInt(req.query.itemsPerPage)||5;
            const totalExpenses=await req.user.countExpenses();
            console.log(page);
      
              const data=await UserServices.getExpenses(req,{
               offset:(page-1)*pageSize,
               limit: pageSize,
               order:[['id','DESC']]
              })
             
            res.status(200).json({
               allExpenses: data,
               check,
               currentPage: page,
               hasNextPage: pageSize * page < totalExpenses,
               nextPage: page + 1,
               hasPreviousPage: page > 1,
               previousPage: page - 1,
               lastPage: Math.ceil(totalExpenses / pageSize) 
            })
           
           } catch (error) {
      
              console.log(error);
              res.status(500).json({error,success:false})
              console.log(JSON.stringify(error));
              
           }
  }
              
  function uploadToS3(data , filename){
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET ;
    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        //Bucket: BUCKET_NAME
    })
        var params = {
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: data,
            ACL: 'public-read'
        }
        return new Promise((resolve,reject)=>{
            s3bucket.upload(params, (err, s3response)=>{
                if(err){
                    console.log("something went wrong",err)
                    reject(err)
                }else{
                    console.log("success" , s3response)
                   // return res.status(200).json({fileURL , succes: true})
                   resolve(s3response.Location)
                }
            })
        })       
}
        
        const downloadExpenses=async(req,res)=>{
          try{
          const expenses=await UserServices.getExpenses(req);
          //console.log(expenses)
          const stringifiedExpenses=JSON.stringify(expenses);
          //it should depend upon the userid
          const userId=req.user.id;
          const filename=`Expense${userId}/${new Date()}.txt`;
          const fileUrl=await S3Services.uploadToS3(stringifiedExpenses,filename);
          
          console.log("hi")
          res.status(200).json({fileUrl,success:true});
        }
      
      catch(err)
      {
        console.log(err)
       res.status(500).json({fileUrl:"",success:false,err:err});
      }
    }

        const deleteExpense=async(req,res)=>{
          const t=await sequelize.transaction();
          const expenseid = req.params.expenseid
          try{
            if(req.params.expenseid == 'undefined')
            {
         
                console.log('ID is Missing');
                return res.status(400).json({err:'Id is missing'})
            }
             const expense=await Expense.findByPk(expenseid);
             const expenseamount=expense.expenseamount;

            const noOfRows= await Expense.destroy({where:{id:expenseid,userId: req.user.id}})

             
              if(noOfRows==0)
              {
                return res.status(404).json({success:false,message:"expense doesnot belong to the user"})
              }

              const updatedtotalexpense=Number(req.user.totalexpense)-Number(expenseamount)
              await User.update({totalexpense:updatedtotalexpense
              },{
                where:{id:req.user.id},
                 transaction:t
                })
          
              await t.commit();
             
             return res.status(200).json({success:true,message:"expense deleted successfully"})
            }
           catch(err)  {
            await t.rollback();
            console.log(err);
            return res.status(500  ).json(err)
           }
        }
        module.exports={
          Index,
          submitExpense,
          getExpense,
          uploadToS3,
          downloadExpenses,
          deleteExpense
        }

  


