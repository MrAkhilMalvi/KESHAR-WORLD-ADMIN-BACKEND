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
const apiRateLimit = require('./helpers/rateLimit');

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


/*
const metricsInterval = Prometheus.collectDefaultMetrics();

const httpRequestDurationMicroseconds = new Prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500] // buckets for response time from 0.1ms to 500ms
});



// Runs before each requests
app.use((req, res, next) => {
  res.locals.startEpoch = Date.now();
  next();
})

app.use(function (req, res, next) {
  var send = res.send;
  res.send = function (body) { // It might be a little tricky here, because send supports a variety of arguments, and you have to make sure you support all of them!

    const responseTimeInMs = Date.now() - res.locals.startEpoch;
    httpRequestDurationMicroseconds
      .labels(req.method, req.path, res.statusCode)
      .observe(responseTimeInMs);

    send.call(this, body);
  };

  next();
}); */

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

// enable detailed API logging in dev env
//if (app.get('env') === 'development') {
//expressWinston.requestWhitelist.push('body');
//expressWinston.responseWhitelist.push('body');
/* app.use(expressWinston.logger({
  winstonInstance,
  meta: false, // optional: log meta data about request (defaults to true)
  msg: '{method:{{req.method}},url:{{req.url}},userId:{{req.user?req.user.id:null}},userAgent:{{req.headers["user-agent"]}},statusCode:{{res.statusCode}},responseTime:{{res.responseTime}}ms,remoteAddress:{{req.headers["x-forwarded-for"]?req.headers["x-forwarded-for"]:req.connection.remoteAddress}}}',
  colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
})); */
//}

/*

app.get('/metrics', (req, res) => {
  res.set('Content-Type', Prometheus.register.contentType);
  res.end(Prometheus.register.metrics());
});
*/

/* app.use("/", (req,res) => {
  res.send("wlecome");
}); */


// mount all routes on /api path
app.use((req,res,next) => apiRateLimit.apiChecker(req,res,next));

app.use("/api", routes);


// if error is not an instanceOf APIError, convert it.
// old version code using express-validation npm package
// app.use((err, req, res, next) => {
//   if (err instanceof expressValidation.ValidationError) {
//     // validation error contains errors which is an array of error each containing message[]
//     const unifiedErrorMessage = err.errors
//       .map(error => error.messages.join(". "))
//       .join(" and ");
//     const error = new APIError(unifiedErrorMessage, err.status, true);
//     return next(error);
//   } else if (!(err instanceof APIError)) {
//     const apiError = new APIError(err.message, err.status, err.isPublic);
//     return next(apiError);
//   }
//   return next(err);
// });

// new version of npm package celebrate instead using of npm express-validation
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
