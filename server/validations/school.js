const Joi = require("joi");

module.exports = {
  updateSchoolData: {
    body: Joi.object({
      school_code: Joi.string()
        .regex(/^\d{2,3}\.\d{4}$/)
        .required(),
      school_name: Joi.string().required(),
      email: Joi.string().required(),
      mobileno: Joi.string()
        .regex(/^[0-9]{10}$/)
        .required(),
       ao_download_cnt: Joi.number().required(),
       ht_download_cnt: Joi.number().required(),
       ao_download_list_cnt: Joi.number().required(),
       ht_download_list_cnt: Joi.number().required()
    }),
  },

  getschooldetails: {
    body: Joi.object({
      school_code: Joi.string()
        .regex(/^\d{2,3}\.\d{4}$/)
        .required(),
    }),
  },

  assessment_order_zip: {
    body: Joi.object({
      school_code: Joi.string()
        .regex(/^\d{2,3}\.\d{4}$/)
        .required(),
    }),
  },

  ht_order_zip: {
    body: Joi.object({
      school_code: Joi.string()
        .regex(/^\d{2,3}\.\d{4}$/)
        .required(),
    }),
  },

  school_usage_status: {
    body: Joi.object({
      schoolcode: Joi.string()
        .regex(/^\d{2,3}\.\d{4}$/)
        .required(),
    }),
  },

  school_candidate_not_in_zip: {
    body: Joi.object({
      schoolcode: Joi.string()
        .regex(/^\d{2,3}\.\d{4}$/)
        .required(),
    }),
  },
};
