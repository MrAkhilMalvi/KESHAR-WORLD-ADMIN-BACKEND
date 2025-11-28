const joi = require('joi');

module.exports = {

    student_count_according_allocated_subject : {
        body : joi.object({
        pagesize : joi.number().required(),
        pagenumber : joi.number().required(),
        subj_code : joi.string().min(1),
        subj_name : joi.string().min(1),
        orderby : joi.string().min(1),
        ordersorting : joi.string().min(3).max(4).valid('ASC', 'DESC')
        })
    },

    school_wise_student_count : {
        body : joi.object({
        pagesize : joi.number().required(),
        pagenumber : joi.number().required(),
        schoolcode : joi.string().min(1),
        schoolname : joi.string().min(1),
        schoolmobile : joi.string().min(1),
        schoolemail : joi.string().min(1),
        distcode : joi.number(),
        distname : joi.string().min(1),
        orderby : joi.string().min(1),
        ordersorting : joi.string().min(3).max(4).valid('ASC', 'DESC')
        })
    },

    distmaster_audit_total_list : {
        body : joi.object({
        pagesize : joi.number().required(),
        pagenumber : joi.number().required(),
        distcode : joi.number(),
        distname : joi.string().min(1)
        })
    },

    audited_improper_school_list : {
        body: joi.object({
        pagesize : joi.number().required(),
        pagenumber : joi.number().required(),
        distcode : joi.number(),
        distname : joi.string().min(1),
        schoolcode : joi.string().min(1),
        schoolname : joi.string().min(1),
        email : joi.string().min(1),
        mobileno : joi.string().min(1)
        })
    }
}