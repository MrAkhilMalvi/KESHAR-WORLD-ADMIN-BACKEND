const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compress = require("compression");
const methodOverride = require("method-override");
const {status} = require("http-status");
const expressWinston = require("express-winston");
const { isCelebrateError } = require('celebrate');
const helmet = require("helmet");
const {loggers}= require("./winston");
const routes = require("../server/routes");
const APIError = require("../server/helpers/APIError");
const noCache = require('nocache');
const cors = require('cors');


const app = express();

if (app.get("env") === "development") {
  app.use(logger("dev"));
}


// enable CORS - Cross Origin Resource Sharing
app.use(cors({
  origin: ['http://localhost:8081','http://192.168.0.42:8081', 'http://192.168.0.67:8080','http://localhost:8080', 'http://192.168.0.42:8080'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true
}));


// parse body params and attache them to req.body
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(
  helmet({
    frameguard: {
      action: "deny"
    }
  })
);

app.use(noCache());



app.use("/api", routes);

app.use((err, req, res, next) => {
  console.log(err);
  if (isCelebrateError(err)) {
    // Flatten Celebrate error messages
    const errorMessages = [];

    for (const [segment, joiError] of err.details.entries()) {
      const segmentMessages = joiError.details.map(detail => detail.message);
      errorMessages.push(...segmentMessages);
    }

    const unifiedErrorMessage = errorMessages.join('. ');
    const error = new APIError(unifiedErrorMessage, 400, true);
    return next(error);
  }

  if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status || 500, err.isPublic || false);
    return next(apiError);
  }

  return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APIError("API not found", status.NOT_FOUND);
  console.log("404", " asd a error");
  return next(err);
});

// log error in winston transports except when executing test suite
if (app.get("env") !== "test") {
  app.use(
    expressWinston.errorLogger({
      winstonInstance : loggers,
      msg:
        '{method:{{req.method}},url:{{req.url}},userId:{{req.user?req.user.id:null}},userAgent:{{req.headers["user-agent"]}},statusCode:{{res.statusCode}},responseTime:{{res.responseTime}}ms,remoteAddress:{{req.headers["x-forwarded-for"]?req.headers["x-forwarded-for"]:req.connection.remoteAddress}}}',
      colorStatus: true
    })
  );
}

// error handler, send stacktrace only during development
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  let errorResponse = {
    success: false,
    message: err.isPublic
      ? err.message
      : "Something Went wrong.Please try again!",
    stack: app.get("env") === "development" ? err.stack : {}
  };

  if (err.isDialog) {
    errorResponse.isDialog = true;
  }

  res.status(err.status).json(errorResponse);
});

module.exports = app;
