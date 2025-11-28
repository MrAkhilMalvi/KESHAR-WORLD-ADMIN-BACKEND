const config = require("config");
const redisClient = require("../../config/redis.mjs").default;
const axios = require('axios');

const otpService = {
  send,
  resend,
  getRandomOTP,
  saveOTP,
  verify,
  smsOTP,
};

module.exports = otpService;

async function send(mobileNo) {
  try {
    return await saveOTP(mobileNo);
  } catch (error) {
    throw error;
  }
}

async function resend(mobileNo) {
    try {
        return await saveOTP(mobileNo);
    } catch (error) {
        throw error;
    }
}

async function verify(key, userOTP) {
  try {
    const redisOTP = await redisClient.get(key);

    console.log(JSON.parse(redisOTP).otp === userOTP)

    if(JSON.parse(redisOTP).otp === userOTP){448888
      await redisClient.DEL(key);
        return true;
    }

    return false;
  } catch (error) {
    throw error;
  }
}

async function saveOTP(mobileNo) {
  try {
    let otp = await getRandomOTP();

    let values = JSON.stringify({
      otp: otp,
    });

    await redisClient.set(mobileNo, values, { EX: 600 });

    return await smsOTP(mobileNo, otp);
  } catch (error) {
    throw error;
  }
}

async function getRandomOTP() {
  return Math.floor(Math.random() * 900000) + 100000;
}

async function smsOTP(mobileNo, otp) {
  try {
    console.log("OTP ==> " + otp, mobileNo);

    if (process.env.NODE_ENV === "development") {
      return otp;
    }

    const url = config.get("App.2faSms.url");
    const data = new URLSearchParams({
      To: parseInt(mobileNo),
      From: config.get("App.2faSms.adminSenderId"),
      TemplateName: config.get("App.2faSms.adminOtpTemplate"),
      VAR1: otp,
    });

    await axios
      .post(url, data.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },

      })
      return otp 

  } catch (error) {
    throw error;
  }
}
