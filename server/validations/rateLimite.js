const Joi = require('joi');

module.exports = {
    updateRateLimitInfo : {
            body : Joi.object({
                loginMaxAttempts: Joi.number()
                .min(5)
                .required()
                .messages({
                    'number.min' : 'Minimum 5 number is required for "Login Max Attempts".',
                    'any.required' : '"Login Max Attempts" is required.',
                    'number.base' : '"Login Max Attempts" is required in number filed.'
                }),
                requestMaxAttempts: Joi.number()
                .min(5)
                .required()
                .messages({
                    'number.min' : 'Minimum 5 number is required for "Request Max Attempts".',
                    'any.required' : '"Request Max Attempts" is required.',
                    'number.base' : '"Request Max Attempts" is required in number filed.'
                }),
                loginWindowExpire: Joi.number()
                .min(60)
                .required()
                .messages({
                    'number.min' : 'Minimum 60 seconds is required for "Login Window Expire".',
                    'any.required' : '"Login Window Expire" is required.',
                    'number.base' : '"Login Window Expire" is required in number filed.'
                }),
                requestWindowExpire: Joi.number()
                .min(60)
                .required()
                .messages({
                    'number.min' : 'Minimum 60 seconds is required for "Request Window Expire".',
                    'any.required' : '"Request Window Expire "is required.',
                    'number.base' : '"Request Window Expire" is required in number filed.'
                }),
                loginBlockDuration: Joi.number()
                .min(60)
                .required()
                .messages({
                    'number.min' : 'Minimum 60 seconds is required for "Login Block Duration".',
                    'any.required' : '"Login Block Duration" is required.',
                    'number.base' : '"Login Block Duration" is required in number filed.'
                }),
                requestBlockDuration: Joi.number()
                .min(60)
                .required()
                .messages({
                    'number.min' : 'Minimum 60 seconds is required for "Request Block Duration".',
                    'any.required' : '"Request Block Duration" is required.',
                    'number.base' : '"Request Block Duration" is required in number filed.'
                })
            })
        }
    }