const express=require('express');
const PurchaseController=require('../controllers/purchase');
const userauthentication=require('../middleware/auth');

const router=express.Router();

router.get('/premiummembership',userauthentication.authenticate,PurchaseController.purchasepremium);
router.post('/updatetransactionstatus',userauthentication.authenticate,PurchaseController.updateTransactionStatus);


module.exports=router;