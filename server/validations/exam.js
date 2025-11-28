const Joi = require("joi");

module.exports = {
  updateExamValidators: {
    body: Joi.object({
      exam_month_en: Joi.string().required(),
      exam_year_en: Joi.string().required(),
      support_email_en: Joi.string().required(),
      help_line_number_en: Joi.string()
        .regex(/^[0-9]{10}$/)
        .required(),
      board_name_en: Joi.string().required(),
      board_address_en: Joi.string().required(),
      exam_name_en: Joi.string().required(),
      ht_exam_type_en: Joi.string().required(),
      ht_distribution_list_instruction_en: Joi.string().required(),
      ao_distribution_list_instruction_en: Joi.string().required(),
      // logo , this is not available and not change in update
      is_display_ip: Joi.boolean().required(),
      is_display_timestamp: Joi.boolean().required(),
      is_display_page_no: Joi.boolean().required(),
      exam_month_guj: Joi.string().required(),
      exam_year_guj: Joi.string().required(),
      support_email_guj: Joi.string().required(),
      help_line_number_guj: Joi.string()
        .pattern(/^[0-9\u0AE6-\u0AEF]{10}$/)
        .required()
        .messages({
          "string.pattern.base":
            "Helpline number must be 10 digits (Gujarati or English).",
        }),
      board_name_guj: Joi.string().required(),
      board_address_guj: Joi.string().required(),
      exam_name_guj: Joi.string().required(),
      ht_exam_type_guj: Joi.string().required(),
      ao_exam_type_guj: Joi.string().required(),
      ht_distribution_list_instruction_guj: Joi.string().required(),
      ao_distribution_list_instruction_guj: Joi.any(),
      max_download_limit: Joi.number().min(10).required(),
      admin_header: Joi.string().required(),
      help_line_time_en: Joi.string().required(),
      ao_exam_type_en: Joi.string().required(),
      help_line_time_guj: Joi.string().required(),
    }),
  },
};
