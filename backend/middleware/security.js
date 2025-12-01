const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const config = require("../config/config")

const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max_requests,
    message:"Too many requests from this IP, try again later",
    standardHeaders:true,
    legacyHeaders:false,
})

const authLimiter = rateLimit({
    windowMs:15*60*1000,
    max:5,
    skipSuccessfulRequests:true,
    message:"Too many authentication attempts, try again later."
})

const securityHeaders = helmet({
    contentSecurityPolicy:{
        directives:{
            defaultSrc:["'self'"],
            styleSrc:["'self'","'unsafe-inline'"],
        },
    },
})

module.exports = {limiter, authLimiter, securityHeaders}