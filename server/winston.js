const winston = require('winston');

const pgClient = require("./../config/db");
const { format } = winston;

const loggers = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            showLevel: true,
            colorize: true
        })
    ]
});

module.exports = {loggers};