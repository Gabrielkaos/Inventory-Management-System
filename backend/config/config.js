require('dotenv').config()


module.exports = {
    server:{
        port:process.env.PORT
        env:process.env.ENV
    },

    logger:{
        log_level:process.env.PORT
    }
}