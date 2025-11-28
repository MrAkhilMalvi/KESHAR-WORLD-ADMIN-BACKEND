const express = require("express");
const { celebrate, Segments } = require("celebrate");
const paramValidation = require("../validations/admin-login");
const adminLoginCtrl = require("../controllers/admin-login.js");
const router = express.Router();


router.route("/health-check").get(function (req, res) {
  console.log("=========================");
  console.log("I am helth-check");
  console.log("=========================");
  res.statusCode = 200;
  res.send("OK");
});

router
  .route("/")
  .post(
    celebrate({ [Segments.BODY]: paramValidation.loginUser.body }),
    adminLoginCtrl.loginUser
  );

router
  .route("/verifyOTP")
  .post(
    celebrate({ [Segments.BODY]: paramValidation.verifyOTP.body }),
    adminLoginCtrl.verifyOTP
  );
router
  .route("/resendOTP")
  .post(
    celebrate({ [Segments.BODY]: paramValidation.resendOTP.body }),
    adminLoginCtrl.resendOTP
  );

module.exports = router;
