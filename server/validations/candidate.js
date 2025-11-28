const Joi = require('joi');
const { query } = require('../../config/db');

module.exports = {

    search: {
        query: Joi.object({
            seatno: Joi.string(),
            is_hold: Joi.boolean(),
            name : Joi.string(),
            sidno : Joi.string(),
            school_code : Joi.string(),
           
        })
    },

    updateOnHold: {
        body: Joi.object({
            seatno: Joi.string().required(),
            on_hold: Joi.boolean().required(),
        })
    },

    getCandidateDetail : {
        body : Joi.object({
            seatno : Joi.string().required()
        })
    },

    updateCandidateDetail : {
        body : Joi.object({
            seatno : Joi.string().required(),
            birthdate : Joi.date().required()
        })
    }
};
