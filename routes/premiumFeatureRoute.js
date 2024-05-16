const express=require('express');
const PremiumFeatureController=require('../controllers/premiumFeature');
const userauthentication=require('../middleware/auth');

const router=express.Router();

router.get('/showLeaderBoard', userauthentication.authenticate,PremiumFeatureController.getUserLeaderBoard);

module.exports=router