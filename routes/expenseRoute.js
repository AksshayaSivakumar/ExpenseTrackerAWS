
const express=require('express');
const ExpenseController=require('../controllers/expense');
const userauthentication=require('../middleware/auth');

const router=express.Router();

router.get('/index',ExpenseController.Index);
router.post('/submitexpense',userauthentication.authenticate, ExpenseController.submitExpense);
router.get('/download',userauthentication.authenticate,ExpenseController.downloadExpenses);
router.get('/get-expense',  userauthentication.authenticate, ExpenseController.getExpense);
router.delete('/delete-expense/:expenseid', userauthentication.authenticate,ExpenseController.deleteExpense)


module.exports=router;