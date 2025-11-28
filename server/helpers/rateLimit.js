const pgClient = require("../../config/db");
const redisClient = require("../../config/redis.mjs").default;
const config = require("config");
const { status } = require("http-status");
const APIError = require("./APIError");
const jwt = require("jsonwebtoken");

const skipAPI = ["/api/projectmeta"];

const loginAPI = [
  "/api/admin-login/",
  "/api/admin-login/verifyOTP",
  "/api/admin-login/resendOTP",
  "/api/forgot-password/verify/mobile",
  "/api/forgot-password/verifyOTP",
  "/api/forgot-password/resendOTP",
  "/api/forgot-password/update/password",
];

async function getRateLimitInfo() {
  try {
    const result = await pgClient.query(
      "SELECT * FROM get_rate_limit_info()",
      []
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
}

async function redis_ratelimit(api, apikey, rateInfo, res, usercode) {
  try {
    // if api is login related
    if (loginAPI.includes(api)) {
      // create redis object is not exists and if exists then increment counts
      const count = await redisClient.incr(apikey);

      // if first time redis key created
      if (count === 1) {
        await redisClient.expire(apikey, rateInfo[0].login_window_expire);
      }

      // if incremented count is equal to login max attempts count then block the user
      if (count >= rateInfo[0].login_max_attempts) {
        const key = `block:${usercode}`;
        // Get current UNIX timestamp in seconds
        const now = Math.floor(Date.now() / 1000);

        // Calculate unblock time
        const unblockAt = new Date(
          (now + rateInfo[0].login_block_duration) * 1000
        );

        // Store in Redis with expiry
        // The Redis key will auto-expire after blockSeconds
        await redisClient.set(key, String(unblockAt), {
          EX: rateInfo[0].login_block_duration,
        });

        // delete perviously generated user all redis key for all the request.
        // Because after user block we don't has to store in the redis
        const keys = await redisClient.keys(`ratelimit:${usercode}:*`);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }

        // store the block user record in database
        await pgClient.query(
          "SELECT * FROM store_rate_limited_block_user($1, $2, $3, $4)",
          ["ADMIN", usercode, unblockAt, null]
        );

        return res.status(429).send({
          success: false,
          message: "Too many request.",
          blockTime: unblockAt,
        });
      }

      return;
    }
    // if api is other api
    else {
      // if first time redis key created
      const count = await redisClient.incr(apikey);

      // if first time redis key created
      if (count === 1) {
        await redisClient.expire(
          apikey,
          60 * rateInfo[0].request_window_expire
        );
      }

      /*
      If the incremented count is equal to the other requested max attempts count
      then block it 
      */
      if (count >= rateInfo[0].request_max_attempts) {
        const key = `block:${usercode}`;
        // Get current UNIX timestamp in seconds
        const now = Math.floor(Date.now() / 1000);

        // Calculate unblock time
        const unblockAt = new Date(
          (now + rateInfo[0].login_block_duration) * 1000
        );

        // Store in Redis with expiry
        // The Redis key will auto-expire after blockSeconds
        await redisClient.set(key, String(unblockAt), {
          EX: rateInfo[0].login_block_duration,
        });

        // delete perviously generated user all redis key for all the request.
        // Because after user block we don't has to store in the redis
        const keys = await redisClient.keys(`ratelimit:${usercode}:*`);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }

        // store the block user record in database
        await pgClient.query(
          "SELECT * FROM store_rate_limited_block_user($1, $2, $3, $4)",
          ["ADMIN", usercode, unblockAt, null]
        );

        return res.status(429).send({
          success: false,
          message: "Too many request.",
          blockTime: unblockAt,
        });
      }

      return;
    }
  } catch (error) {
    throw error;
  }
}

async function ratelimit(req, res, next) {
  try {
    const api = req.url || req.originalURL;
    

    if (skipAPI.includes(api)) {
      return next();
    }

    const rateInfo = await getRateLimitInfo();
    let usercode = null;
   
    // if api is login or forgot password
    if(loginAPI.includes(api) && req.body?.mobile_no){
      
        usercode = req.body?.mobile_no;

    }
    

    // if api is not login and forgot-password
    if (req.header("x-auth-token")) {
      let token = req.header("x-auth-token");

      if (!token) {
        throw new Error(
          new APIError("No token provided", httpStatus.UNAUTHORIZED, true)
        );
      }

      jwt.verify(
        token,
        config.get("App.config.jwtSecret"),
        function (err, decoded) {
          if (err) {
            throw new APIError(
                "You are not authorize,Please login first",
                status.UNAUTHORIZED,
                true,
                true
              )
          } else {
            usercode = decoded.code;
          }
        }
      );
    }

    // const usercode = req.body?.mobile_no || req.user?.code || null;
    const apimethod = req.method;
    const ipaddress =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() || // from proxy
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress;

    // block user key
    const block_key = `block:${usercode}`;

    // if user is block then send response with block time
    if (await redisClient.get(block_key)) {
      return res.status(429).send({
        success: false,
        message: "Too many request.",
        blockTime: new Date(await redisClient.get(block_key)),
      });
    }

    const apikey = `ratelimit:${usercode}:${apimethod}:${ipaddress}:${api}`;

    /*
    create the redis for all the api 
    */

    await redis_ratelimit(api, apikey, rateInfo, res, usercode);

    if (res.headersSent) {
      return; // stop here, don't call next()
    }

    return next();
  } catch (error) {
    let err;
    if (error.code === "22222") {
      err = new APIError(error.message, status.NO_CONTENT, true, true);
    } else {
      err = new APIError(
        error.message || "Database query failed",
        500,
        true,
        true
      );
    }
    next(err);
  }
}

module.exports = { apiChecker: ratelimit };
