const httpStatus = require('http-status');
const APIError = require('./APIError');
const jsonData = require('./errorCode.json');
let _ = require('lodash');

exports.errorHandler = function (code, message, constraint) {
    var errorObj;
    let msg;
    switch (code) {
        case '42601':
            errorObj = {
                success: false,
                code: '42601',
                devMsg: 'Sql Syntax error',
                message: 'Something Went wrong.Please try again'
            };
            break;
        case '42703':
            errorObj = {
                success: false,
                code: '42703',
                devMsg: 'Unknown Column',
                message: 'Something Went wrong.Please try again'
            };
            break;
        case '23503':
            switch (constraint) {
                case 'fk_test_section_test_id':
                    msg = 'To Delete this test. You need to delete their section first.';
                    break;

                default:
                    msg = 'This module has been already used by other modules';
                    break;
            }

            errorObj = {
                success: false,
                code: '23503',
                devMsg: 'violates foreign key constraint',
                message: msg
            };
            break;
        case '23505':
            switch (constraint) {
                case 'uni_users_mobile_no':
                    msg = 'Mobile number already registered.';
                    break;
                default:
                    msg = 'Duplicate entry for Unique key constraint';
                    break;
            }
            errorObj = {
                success: false,
                code: '23505',
                devMsg: 'Duplicate Entry',
                message: msg
            };
            break;
        case '23514':
            switch (constraint) {
                case 'chk_test_session_time_from_time_to':
                    message = 'Exam shedule from_time should be smaller then to_time';
                    break;
                default:
                    message = 'Check constraint failed';
                    break;
            }
            errorObj = {
                success: false,
                code: '23514',
                devMsg: 'Check constraint failed',
                message: message
            };
            break;
        case '22P02':
            errorObj = {
                success: false,
                code: '22P02',
                devMsg: 'Invalid Text Representation',
                message: 'Data is not proper.'
            };
            break;
        case '08P01':
            errorObj = {
                success: false,
                code: '08P01',
                devMsg: 'Protocol Violation',
                message: 'Data is not available.'
            };
            break;
        case '42883':
            errorObj = {
                success: false,
                code: '42883',
                devMsg: 'Undefined Function',
                message: 'Function is Undefined.'
            };
            break;
        case '11111':
        case '22222':
            errorObj = {
                success: false,
                message: message,
                code : '22222'
            };
            break;
        default:
            let errMessage = _.find(jsonData, {
                code: code
            });
            message = message.replace(/%/g, '');
            if (message) {
                errorObj = {
                    success: false,
                    message: message
                };
            } else if (errMessage) {
                errorObj = {
                    success: false,
                    message: errMessage
                };
            } else {
                errorObj = {
                    success: false,
                    devMsg: 'Error',
                    message: 'Error Occured.Please contact administrator'
                };
            }
            break;
    }

    return errorObj;
}