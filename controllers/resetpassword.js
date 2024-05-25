const path=require('path');
const rootDir=require('../util/path');

const uuid = require("uuid");
const Sib = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");
const dotenv =require("dotenv");
dotenv.config()
const User = require("../models/user");
const Forgotpassword = require("../models/forgotpassword");

const defaultClient = Sib.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const passwordresetform = async (req, res) => {
  res.sendFile(path.join(rootDir,'public','forgotpassword.html'));
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ where: { email:email } });

    if (user) {
      const id = uuid.v4();
      console.log(id);
      user.createForgotpassword({ id, active: true }).catch((err) => {
        throw new Error(err);
        
      });

      const client = Sib.ApiClient.instance;
      const apiKey = client.authentications["api-key"];
      apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

      

      const sender = {
        email: "aksshayapugal@gmail.com",
        name: "Expense Tracker-Admin",
      };

      const recievers = [
        {
          email: email,
        },
      ];
      console.log(email)
      const tranEmailApi = new Sib.TransactionalEmailsApi();
      tranEmailApi.sendTransacEmail({
          sender,
          subject: "Reset Password Mail",
          
          to: recievers,
          htmlContent: `
                        <h1>Kindly reset the password through below link...</h1>
                        <a href="http://13.234.119.110:3004/password/resetpassword/${id}">Reset password</a>
                    `,
        })
        .then((result) => {
          console.log(result);
          return res.status(201).json({
            success: true,
            message: "reset password link has been sent to your email",
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      throw new Error("User doesnt exist");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error, sucess: false });
  }
};

const resetPassword = async (req, res) => {
  try {
    const id = req.params.id;
    Forgotpassword.findOne({ where: { id } }).then((forgotpasswordrequest) => {
      if (forgotpasswordrequest) {
        if (forgotpasswordrequest.active === true) {
          forgotpasswordrequest.update({ active: false });
          res.status(200).send(`<html>
                                <script>
                                    function formsubmitted(e){
                                            e.preventDefault();
                                                console.log('called')
                                    }
                                </script>
                                    <form action="http://35.154.29.238:3004/password/updatepassword/${id}" method="get">
                                            <label for="newpassword">Enter New password</label>
                                             <input name="newpassword" type="password" required></input>
                                             <button>reset password</button>
                                     </form>
                            </html>`);
          res.end();
        } else {
          throw new Error("request has expired");
        }
      } else {
        throw new Error("request not found");
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const updatePassword = (req, res) => {
  try {
    const { newpassword } = req.query;
    const resetpasswordid = req.params.id;
    Forgotpassword.findOne({ where: { id: resetpasswordid } }).then(
      (resetpasswordrequest) => {
        User.findOne({ where: { id: resetpasswordrequest.userId } }).then(
          (user) => {
            // console.log('userDetails', user)
            if (user) {
              //encrypt the password
              const saltRounds = 10;
              bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) {
                  console.log(err);
                  throw new Error(err);
                }
                bcrypt.hash(newpassword, salt, function (err, hash) {
                  // Store hash in your password DB.
                  if (err) {
                    console.log(err);
                    throw new Error(err);
                  }
                  user.update({ password: hash }).then(() => {
                    res
                      .status(201)
                      .json({
                        message: "Successfuly updated the new password",
                      });
                  });
                });
              });
            } else {
              return res
                .status(404)
                .json({ error: "No user Exists", success: false });
            }
          }
        );
      }
    );
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