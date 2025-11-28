const pgClient = require("../../config/db");
const bcrypt = require("bcrypt");
const { status } = require("http-status");
const config = require("config");
const jwt = require("jsonwebtoken");
const jwtSecret = config.get("App.config.jwtSecret");
const APIError = require("../helpers/APIError");
const otpService = require("../helpers/otpService");
// const app = express();
const { error_logs_response } = require("../helpers/error_logs");

let adminLoginCtrl = {
  loginUser: loginUser,
  verifyOTP: verifyOTP,
  resendOTP: resendOTP,
  comparePassword: comparePassword,
  generateJWTToken: generateJWTToken,
};

module.exports = adminLoginCtrl;

/*
 Login user
 1. Find the user password from db by mobileno
 2. Compare password
 3. Send OTP to user mobileno
*/
async function loginUser(req, res, next) {
  let mobileNo = req.body.mobile_no;
  let userPassword = req.body.password;

  try {
    const result = await pgClient.query(
      "SELECT * FROM admin_login_get_password_by_mobile_no($1)",
      [mobileNo]
    );

    if (!result.rows.length > 0) {
      throw new APIError(
        "Incorrect username password.",
        status.UNAUTHORIZED,
        true,
        true
      );
    }

    let dbPassword = result.rows[0].password;

    const isPasswordMatch = await comparePassword(userPassword, dbPassword);

    if (!isPasswordMatch) {
      throw new APIError(
        "Incorrect username password.",
        status.UNAUTHORIZED,
        true,
        true
      );
    }

    // send otp to the user
    const otp = await otpService.send(mobileNo);

    if (process.env.NODE_ENV === 'development') {  
        res.send({ success: true, otp: otp });
    }else{
      res.send({ success: true, message: " otp send success full" });
    }
   
  } catch (error) {
    error_logs_response(req, __filename, error, mobileNo);
    let err;
    if (error.code === "22222") {
      err = new APIError(error.message, status.NO_CONTENT, true, true);
    } else {
      err = new APIError(
        error.message || "Database query failed",
        500,
        true,
        true
      );
    }
    next(err);
  }
}

// compare password
async function comparePassword(userPassword, dbPassword) {
  try {
    const isMatch = await bcrypt.compare(userPassword, dbPassword);

    return isMatch;
  } catch (error) {
    throw error;
  }
}

/*
1. Verify the otp as per the mobileno
2. Get the user Data as per the mobileno
3. Generate JWT token
*/
async function verifyOTP(req, res, next) {
  let userOTP = req.body.otp;
  let mobileNo = req.body.mobile_no;

  try {
    const isVerify = await otpService.verify(mobileNo, userOTP);

    if (!isVerify) {
      return res.send({ success: false, message: "OTP is not verified." });
    }

    const userData = await pgClient.query(
      "SELECT * FROM admin_login_get_user_by_mobile_no($1)",
      [mobileNo]
    );

    const jwtToken = await generateJWTToken(userData.rows[0]);

    return res.send({success : true, data : userData.rows[0], token : jwtToken});

  } catch (error) {
    error_logs_response(req, __filename, error, mobileNo);
    next(error);
  }
}

// generate jwt token
async function generateJWTToken(userData) {
  return jwt.sign(
    {
      id: userData.id,
      code: userData.code,
      name: userData.name,
      mobile_no: userData.mobile_no,
    },
    jwtSecret,
    { expiresIn: "12h" }
  );
}

// resend otp
async function resendOTP(req, res, next) {
  let mobileNo = req.body.mobile_no;
  try {
    const otp = await otpService.resend(mobileNo);

    return res.send({success: true, message : "User verified successfully and OTP has been sent to your registered mobile no", otp : otp})
  } catch (error) {
    error_logs_response(req, __filename, error, mobileNo);
    next(error);
  }
  
}
