const express = require("express")
const cors = require("cors")
const config = require("./config/config")
const { connectDB } = require("./config/database")
const logger = require("./utils/logger")

app = express()
const PORT = config.server.port

connectDB()

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  })
  next()
})


app.listen(PORT,()=>{
    logger.info(`Server running on port ${PORT}`)
    logger.info(`Environment ${config.server.env}`)
})