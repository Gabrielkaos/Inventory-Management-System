const express = require("express")
const cors = require("cors")
const config = require("./config/config")
const { connectDB } = require("./config/database")
const logger = require("./utils/logger")
const {limiter, securityHeaders} = require("./middleware/security")
const {errorHandler, asyncHandler, notFound} = require("./middleware/errorHandler")

app = express()
const PORT = config.server.port

connectDB()

app.set("trust proxy",1)

//security
app.use(securityHeaders)
app.use(limiter)


//cors and express.json
app.use(cors({
    origin:config.cors.origin,
    credentials:true
}))
app.use(express.json({limit:"10mb"}))
app.use(express.urlencoded({limit:"10mb",extended:true}))


//middleware for logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  })
  next()
})

app.use(notFound)
app.use(errorHandler)

app.listen(PORT,()=>{
    logger.info(`Server running on port ${PORT}`)
    logger.info(`Environment ${config.server.env}`)
})