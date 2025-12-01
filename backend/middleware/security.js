const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const config = require("../config/config")

const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max_requests,
    message:"Too many requests from this IP, try again later",
    standardheaders:true,
    legacyHeaders:false,
})


module.exports = {limiter}