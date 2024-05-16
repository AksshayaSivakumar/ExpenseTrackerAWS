const express=require('express');
const ResetPasswordController=require('../controllers/resetpassword');

const router=express.Router();

router.get('/passwordresetform',ResetPasswordController.passwordresetform);
router.post('/forgotpassword',ResetPasswordController.forgotPassword);
router.get('/resetpassword/:id',ResetPasswordController.resetPassword);
router.get('/updatepassword/:id', ResetPasswordController.updatePassword);
module.exports=router;