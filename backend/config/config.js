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
        windowMs:parseInt(process.env.RATE_LIMIT_WINDOW_MS),
        max_requests:parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
    }
}