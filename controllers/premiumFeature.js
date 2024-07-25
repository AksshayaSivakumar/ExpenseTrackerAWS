const mongoose = require('mongoose');
const User = require('../models/user');
const Expense = require('../models/expense');

const getUserLeaderBoard = async (req, res) => {
  try {
    const leaderboardOfusers = await User.find().sort({ totalexpense: -1 });
    res.status(200).json(leaderboardOfusers);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

module.exports = {
  getUserLeaderBoard
};