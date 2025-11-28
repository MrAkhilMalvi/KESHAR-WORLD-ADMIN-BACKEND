const config = require('config');
const {status} = require('http-status');
const APIError = require('./APIError');
const jwt = require('jsonwebtoken');
const auth = {};

auth.verifyToken = function (req, res, next) {
    let token = req.header('x-auth-token');

    if (!token) {
    return next(new APIError('No token provided', status.UNAUTHORIZED, true));
  }

    jwt.verify(token, config.get('App.config.jwtSecret'), function (err, decoded) {
        if (err) {
            next(new APIError('You are not authorize,Please login first', status.UNAUTHORIZED, true));
        } else {
            req.user = decoded;
            next();
        }
    });
};

module.exports = auth;
