const path = require('path');
const rootDir = require('../util/path');

const uuid = require("uuid");
const Sib = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/user");
const Forgotpassword = require("../models/forgotpassword");

const defaultClient = Sib.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const passwordresetform = async (req, res) => {
  res.sendFile(path.join(rootDir, 'public', 'forgotpassword.html'));
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });

    if (user) {
      const id = uuid.v4();
      console.log(id);
      const newForgotPassword = new Forgotpassword({ id, active: true, userId: user._id });
      await newForgotPassword.save();

      const sender = {
        email: "aksshayapugal@gmail.com",
        name: "Expense Tracker-Admin",
      };

      const receivers = [{ email: email }];
      console.log(email);

      const tranEmailApi = new Sib.TransactionalEmailsApi();
      await tranEmailApi.sendTransacEmail({
        sender,
        subject: "Reset Password Mail",
        to: receivers,
        htmlContent: `
          <h1>Kindly reset the password through below link...</h1>
          <a href="http://13.234.119.110:3004/password/resetpassword/${id}">Reset password</a>
        `,
      });

      return res.status(201).json({
        success: true,
        message: "reset password link has been sent to your email",
      });

    } else {
      throw new Error("User doesn't exist");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error, success: false });
  }
};

const resetPassword = async (req, res) => {
  try {
    const id = req.params.id;
    const forgotpasswordrequest = await Forgotpassword.findOne({ id });

    if (forgotpasswordrequest) {
      if (forgotpasswordrequest.active) {
        await forgotpasswordrequest.updateOne({ active: false });
        res.status(200).send(`
          <html>
            <script>
              function formsubmitted(e){
                e.preventDefault();
                console.log('called');
              }
            </script>
            <form action="http://35.154.29.238:3004/password/updatepassword/${id}" method="get">
              <label for="newpassword">Enter New password</label>
              <input name="newpassword" type="password" required></input>
              <button>reset password</button>
            </form>
          </html>
        `);
        res.end();
      } else {
        throw new Error("request has expired");
      }
    } else {
      throw new Error("request not found");
    }
  } catch (error) {
    console.log(error);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { newpassword } = req.query;
    const resetpasswordid = req.params.id;
    const resetpasswordrequest = await Forgotpassword.findOne({ id: resetpasswordid });

    if (resetpasswordrequest) {
      const user = await User.findById(resetpasswordrequest.userId);

      if (user) {
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, (err, salt) => {
          if (err) {
            console.log(err);
            throw new Error(err);
          }
          bcrypt.hash(newpassword, salt, async (err, hash) => {
            if (err) {
              console.log(err);
              throw new Error(err);
            }
            await user.updateOne({ password: hash });
            res.status(201).json({
              message: "Successfully updated the new password",
            });
          });
        });
      } else {
        return res.status(404).json({ error: "No user Exists", success: false });
      }
    }
  } catch (error) {
    return res.status(403).json({ error, success: false });
  }
};

module.exports = {
  passwordresetform,
  forgotPassword,
  resetPassword,
  updatePassword,
};