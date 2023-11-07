const User = require("../models/User");
const OTP = require("../models/OTPr");
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//Send OTP

exports.sendOTP = async (req, res) => {
  try {
    //fetch email from request body
    const { email } = req.body;

    //check if user already exists or not.
    const checkUserPresence = await User.findOne({ email });
    //if User already exists.
    if (checkUserPresence) {
      return res.status(401).json({
        success: false,
        message: "User already registered.",
      });
    }

    //Generate OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP Generated is : ", otp);

    //Now we need to make sure that otp that is generated is unique.
    //check that otp that is generated should unique or not
    //uniqe otp will be unique only if there is no db entry.

    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    //After generating Unique OTP, Now we need to enter this unique OTP into Database.
    const otpPayload = { email, otp };

    //Create and entry in database for OTP
    const otpBody = await OTP.create(otpPayload);
    console.log("OTPBody : ", otpBody);

    //return response successfull.

    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//Signup

exports.signUp = async (req, res) => {
  try {
    //Data fetch from request body.
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //Data Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required.",
      });
    }

    //Match the two passwords i.e. PASSWORD && CONFIRM PASSWORD

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password are different value, and do not match. Please try again.",
      });
    }

    //Check User Already exist or not.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already Registered.",
      });
    }

    //Find most recent OTP stored from the user.

    const recentOTP = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOTPs);

    //Validate OTP

    if (recentOTP.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Recent OTP is not found",
      });
    } else if (otp !== recentOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    //Hash Password.

    const hashedPassword = await bcrypt.hash(password, 10);

    //Entry create in Database.

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    //return res

    return res.status(200).json({
      success: true,
      message: "User is registered successfully.",
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again later.",
    });
  }
};

//Login

exports.login = async (req, res) => {
  try {
    //Get data from request body.

    const { email, password } = req.body;

    //Validation of Data

    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required, Please try again later.",
      });
    }

    //Check user exists or Not.

    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please signup first.",
      });
    }

    //generate JWT, after matching token.

    if (await bcrypt.compare(password, user.password)) {
      const payload = { email: user.email, id: user._id, role: user.role };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      user.token = token;
      user.password = undefined;

      //create cookie and send response

      const options = {
        expiresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 100),
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged In successfully.",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Login Failed. Please try again later.",
    });
  }
};

//Change Password

exports.changePassword = async (req, res) => {
  //get data from request body.
  //get oldPassword, newPassword, confirmNewPassword
  //validation
  //update password in DATABASE
  //send mail -> PASSWORD UPDATED
  //return response
};
