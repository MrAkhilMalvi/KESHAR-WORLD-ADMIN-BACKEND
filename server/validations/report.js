const joi = require('joi');

module.exports = {
    report_candidate_not_include_in_zip : {
        body : joi.object({
            pagesize : joi.number().required(),
            pagenumber : joi.number().required(),
            distcode : joi.number(),
            distname : joi.string().min(1),
            schoolcode : joi.string().min(1),
            sidno : joi.string().min(1),
            hallticket : joi.string().min(1),
            seatno : joi.string().min(1),
            studentname : joi.string().min(1),
            orderby : joi.string().min(1),
            ordersorting : joi.string().min(3).max(4).valid('ASC', 'DESC'),
        })
    }, 

    changeMobileEmailSchoolList : {
        body : joi.object({
            pagesize : joi.number().required(),
            pagenumber : joi.number().required(),
            distcode : joi.number(),
            distname : joi.string().min(1),
            schoolcode : joi.string().min(1),
            orderby : joi.string().min(1),
            ordersorting : joi.string().min(3).max(4).valid('ASC', 'DESC')
        })
    },

    student_on_hold: {
        body : joi.object({
            pagesize: joi.number().required(),
            pagenumber: joi.number().required(),
            seatno: joi.string().min(1),
            schoolcode: joi.string().min(1),
            studentname: joi.string().min(1),
            hallticket: joi.string().min(1),
            sidno: joi.string().min(1),
            distcode: joi.number(),
            schoolname: joi.string().min(1),
            schoolmobile: joi.string().min(1),
            schoolemail: joi.string().min(1),
            districtname: joi.string().min(1),
            orderby: joi.string().min(1),
            ordersorting: joi.string().min(3).max(4).valid('ASC', 'DESC')
        })
    },

     date_wise_subject_details_with_student_count : {
        body : joi.object({
            pagesize : joi.number().required(),
            pagenumber : joi.number().required(),
            sub_name : joi.string().min(1),
            sub_code : joi.string().min(1),
            orderby : joi.string().min(1),
            ordersorting : joi.string().min(3).max(4).valid('ASC', 'DESC')
        })
     },

     district_wise_ht_download_stastics : {
        body : joi.object({
           pagesize : joi.number().required(),
           pagenumber : joi.number().required(),
           distcode : joi.number(),
           distname : joi.string().min(1)
        })
     },

     school_aozip_pending : {
        body : joi.object({
            pagesize : joi.number().required(),
            pagenumber : joi.number().required(),
            distcode : joi.number(),
            distname : joi.string().min(1),
            schoolcode : joi.string().min(1),
            schoolname : joi.string().min(1),
            email : joi.string().min(1),
            mobileno : joi.string().min(1),
            orderby : joi.string().min(1),
            ordersorting : joi.string().min(3).max(4).valid('ASC', 'DESC')
        })
     },

     school_htzip_pending : {
        body : joi.object({
            pagesize : joi.number().required(),
            pagenumber : joi.number().required(),
            distcode : joi.number(),
            distname : joi.string().min(1),
            schoolcode : joi.string().min(1),
            schoolname : joi.string().min(1),
            email : joi.string().min(1),
            mobileno : joi.string().min(1),
            orderby : joi.string().min(1),
            ordersorting : joi.string().min(3).max(4).valid('ASC', 'DESC')
        })
     },

     school_htlist_pending : {
        body : joi.object({
            pagesize : joi.number().required(),
            pagenumber : joi.number().required(),
            distcode : joi.number(),
            distname : joi.string().min(1),
            schoolcode : joi.string().min(1),
            schoolname : joi.string().min(1),
            mobileno : joi.string().min(1),
            orderby : joi.string().min(1),
            ordersorting : joi.string().min(3).max(4).valid('ASC', 'DESC')
        })
     },

     school_aolist_pending : {
        body : joi.object({
            pagesize : joi.number().required(),
            pagenumber : joi.number().required(),
            distcode : joi.number(),
            distname : joi.string().min(1),
            schoolcode : joi.string().min(1),
            schoolname : joi.string().min(1),
            mobileno : joi.string().min(1),
            orderby : joi.string().min(1),
            ordersorting : joi.string().min(3).max(4).valid('ASC', 'DESC')
        })
     },

     student_without_school_location : {
        body : joi.object({
            pagesize : joi.number().required(),
            pagenumber : joi.number().required(),
            seatno : joi.string().min(1),
            studentname : joi.string().min(1),
            schoolcode : joi.string().min(1),
            schoolname : joi.string().min(1),
            email : joi.string().min(1),
            mobileno : joi.string().min(1),
            distcode : joi.number(),
            distname : joi.string().min(1),
            orderby : joi.string().min(1),
            ordersorting : joi.string().min(3).max(4).valid('ASC', 'DESC')
        })
     }
}