const express = require("express")
const cors = require("cors")
const config = require("./config/config")


app = express()

const PORT = config.server.port

app.use(cors())
app.use(express.json())




app.listen(PORT,()=>{console.log(`Server running on port ${PORT}`)})