const express = require("express")
const cors = require("cors")
const config = require("./config/config")
const { connectDB } = require("./config/database")
const logger = require("./utils/logger")
const {limiter, securityHeaders} = require("./middleware/security")
const {errorHandler, notFound} = require("./middleware/errorHandler")
const authRoute = require("./routes/auth")
const productRoute = require("./routes/products")
const categoryRoute = require("./routes/categories")
const supplierRoute = require("./routes/supplier")
const stockTransactionRoute = require("./routes/stockTransaction")

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

//health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.env
  })
})

//routes
app.use("/api/auth",authRoute)
app.use("/api/products",productRoute)
app.use("/api/categories",categoryRoute)
app.use("/api/suppliers",supplierRoute)
app.use("/api/stock-transactions",stockTransactionRoute)

//landing
app.get('/', (req, res) => {
  res.json({
    message: 'Inventory API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      notes: '/api/notes'
    }
  })
})

//error handlers
app.use(notFound)
app.use(errorHandler)

app.listen(PORT,()=>{
    logger.info(`Server running on port ${PORT}`)
    logger.info(`Environment ${config.server.env}`)
})