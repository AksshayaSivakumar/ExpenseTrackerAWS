const path = require('path');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Expense = require('../models/expense');
const User = require('../models/user');
const rootDir = require('../util/path');
const S3Services = require('../services/s3services');
const UserServices = require('../services/userservices');

const Index = async (req, res) => {
  res.sendFile(path.join(rootDir, 'public', 'index.html'));
};

const submitExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { expenseamount, description, category } = req.body;

    if (!expenseamount || expenseamount.length === 0) {
      return res.status(400).json({ success: false, message: "some parameters missing" });
    }

    const expense = new Expense({ expenseamount, description, category, userId: req.user._id });
    await expense.save({ session });

    const totalexpense = Number(req.user.totalexpense) + Number(expenseamount);
    await User.updateOne({ _id: req.user._id }, { totalexpense: totalexpense }, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, expense: expense });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, error: err });
  }
};

const getExpense = async (req, res) => {
  try {
    const check = req.user.ispremiumuser;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.itemsPerPage) || 5;

    const totalExpenses = await Expense.countDocuments({ userId: req.user._id });
    const expenses = await Expense.find({ userId: req.user._id })
      .sort({ _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      allExpenses: expenses,
      check,
      currentPage: page,
      hasNextPage: pageSize * page < totalExpenses,
      nextPage: page + 1,
      hasPreviousPage: page > 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalExpenses / pageSize)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error, success: false });
  }
};

const uploadToS3 = (data, filename) => {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
  });

  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: 'public-read'
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log("something went wrong", err);
        reject(err);
      } else {
        console.log("success", s3response);
        resolve(s3response.Location);
      }
    });
  });
};

const downloadExpenses = async (req, res) => {
  try {
    const expenses = await UserServices.getExpenses(req);
    const stringifiedExpenses = JSON.stringify(expenses);
    const userId = req.user._id;
    const filename = `Expense${userId}/${new Date().toISOString()}.txt`;
    const fileUrl = await S3Services.uploadToS3(stringifiedExpenses, filename);

    res.status(200).json({ fileUrl, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ fileUrl: "", success: false, err: err });
  }
};

const deleteExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const expenseid = req.params.expenseid;
    console.log(expenseid)

    if (!expenseid) {
      console.log('ID is Missing');
      return res.status(400).json({ err: 'Id is missing' });
    }

    const expense = await Expense.findById(expenseid).session(session);
    const expenseamount = expense.expenseamount;

    const result = await Expense.deleteOne({ _id: expenseid, userId: req.user._id }).session(session);
    console.log(result)

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "expense does not belong to the user" });
    }

    const updatedtotalexpense = Number(req.user.totalexpense) - Number(expenseamount);
    await User.updateOne({ _id: req.user._id }, { totalexpense: updatedtotalexpense }, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, message: "expense deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json(err);
  }
};

module.exports = {
  Index,
  submitExpense,
  getExpense,
  uploadToS3,
  downloadExpenses,
  deleteExpense
};