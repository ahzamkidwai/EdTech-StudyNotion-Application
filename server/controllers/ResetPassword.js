const User = require("../models/User");
const mailSender = require("../utilities/mailSender");
const bcrypt = require("bcrypt");

//reset password token
exports.resetPasswordToken = async (req, res) => {
  try {
    //get E-Mail from request body.

    const email = req.body.email;

    //Check user for this email, OR validation on Email

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: "Your Email is not registered with us.",
      });
    }

    //Generate Token

    const token = crypto.randomUUID();

    //Update user by adding token and expiration time.

    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    //create URL

    const url = `https://localhost:3000/update-password/${token}`;

    //Send Mail containing the URL.

    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link : ${url}`
    );

    //Return response.

    return res.json({
      success: true,
      message:
        "E-Mail for reset password is sent successfully. Please check EMail and change Password.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Mail for Reset Password Cannot be sent. PLEASE TY AGAIN LATER.",
    });
  }
};

//reset password

exports.resetPassword = async (req, res) => {
  try {
    //data fetch

    const { password, confirmPassword, token } = req.body;

    //validation

    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "password not matching",
      });
    }

    //get user details from DB using Token

    const userDetails = await user.findOne({ token: token });

    //if no entry - invalid token

    if (!userDetails) {
      return res.status({
        success: false,
        message: "Token is Invalid",
      });
    }

    //token time check

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token is expired, please regenerate token.",
      });
    }

    //hash password

    const hashedPassword = await bcrypt.hash(password, 10);

    //Update the new password with the old Password

    await User.findOneAndUpdate(
      { token: token },
      {
        password: hashedPassword,
      },
      { new: true }
    );

    //return response

    return res.status(200).json({
      success: true,
      message: "Password reset Successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Password reset cannot be done.",
    });
  }
};
