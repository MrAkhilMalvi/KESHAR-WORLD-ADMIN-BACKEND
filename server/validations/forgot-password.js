const Joi = require('joi');

module.exports = {

    forgotPassword: {
        body: {
            mobile_no: Joi.string().regex(/^[0-9]{10}$/).required()
        }
    },

    // POST /login/
    verifyOTP: {
        body: Joi.object({
            otp: Joi.number().max(999999).required(),
            mobile_no: Joi.string().regex(/^[0-9]{10}$/).required()
        })
    },

    // POST /login/verifyOTP
    resendOTP: {
        body: Joi.object({
            mobile_no: Joi.string().regex(/^[0-9]{10}$/).required()
        })
    },

    setPassword: {
        body: Joi.object({
            mobile_no: Joi.string().regex(/^[0-9]{10}$/).required(),
            password: Joi.string().min(6).required()
        })
    }
};
