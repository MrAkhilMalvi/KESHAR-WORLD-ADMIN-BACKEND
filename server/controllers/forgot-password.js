const pgClient = require("../../config/db");
const bcrypt = require("bcrypt");
let saltRounds = 10;
const otpService = require("../helpers/otpService");
const APIError = require("../helpers/APIError");
const { default: status } = require("http-status");

let forgotPasswordCtrl = {
  forgotPassword: forgotPassword,
  verifyOTP: verifyOTP,
  resendOTP: resendOTP,
  setPassword: setPassword,
  getHashPassword: getHashPassword,
};

module.exports = forgotPasswordCtrl;

async function forgotPassword(req, res, next) {
  const { mobile_no } = req.body;

  try {
    await pgClient.query(
      "SELECT * FROM admin_forgotpassword_verify_mobile($1)",
      [mobile_no]
    );

    const otp = await otpService.send(mobile_no);

    return res.send({
      success: true,
      message:
        "User verified successfully and OTP has been sent to your registered mobile no",
      otp: otp,
    });
  } catch (error) {
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

async function verifyOTP(req, res, next) {
  const { otp, mobile_no } = req.body;

  try {
    const isVerify = await otpService.verify(mobile_no, otp);

    if (!isVerify) {
      return res.send({ success: false, message: "Wrong OTP." });
    }

    res.send({ success: true, message: "OTP verified successfuly." });
  } catch (error) {
    next(error);
  }
}

async function resendOTP(req, res, next) {
  const { mobile_no } = req.body;

  try {
    const otp = await otpService.resend(mobile_no);

    res.send({ success: true, otp: otp });
  } catch (error) {
    next(error);
  }
}

async function setPassword(req, res, next) {
  const { mobile_no, password } = req.body;

  try {
    const hashpassword = await getHashPassword(password);

    await pgClient.query(
      "SELECT * FROM admin_forgotpassword_update_password($1,$2)",
      [mobile_no, hashpassword]
    );

    res.send({ success: true });
  } catch (error) {
    if (err.code === "22222") {
      err = new APIError(err.message, 411, true, true);
    }

    next(error);
  }
}

async function getHashPassword(password) {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (err) {
    throw err;
  }
}
