const express = require("express");
const { celebrate, Segments } = require("celebrate");
const paramValidation = require("../validations/forgot-password");
const forgotPasswordCtrl = require("../controllers/forgot-password");
const router = express.Router();

router
  .route("/verify/mobile")
  .post(
    celebrate({[Segments.BODY]:paramValidation.forgotPassword.body}),
    forgotPasswordCtrl.forgotPassword);
router
  .route("/verifyOTP")
  .post(celebrate({[Segments.BODY]:paramValidation.verifyOTP.body}), forgotPasswordCtrl.verifyOTP);
router
  .route("/resendOTP")
  .post(celebrate({[Segments.BODY]:paramValidation.resendOTP.body}), forgotPasswordCtrl.resendOTP);
router
  .route("/update/password")
  .post(celebrate({[Segments.BODY]:paramValidation.setPassword.body}), forgotPasswordCtrl.setPassword);

module.exports = router;
