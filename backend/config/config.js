require('dotenv').config()


module.exports = {
    server:{
        port:process.env.PORT,
        env:process.env.ENV
    },
    cors:{
        origin:process.env.CORS_ORIGIN
    },

    rateLimit:{
        windowMs:RATE_LIMIT_WINDOW_MS,
        max_requests:RATE_LIMIT_MAX_REQUESTS
    }
}