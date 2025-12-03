const jwt = require("jsonwebtoken")
const express = require("express")
const logger = require("../utils/logger")
const {asyncHandler} = require("../middleware/errorHandler")
const authMiddleWare = require("../middleware/auth")
const {Product} = require("../models/index")

router = express.Router()



router.use(authMiddleWare)


router.get("/", asyncHandler(async (req, res)=>{
    
    const products = Product.findAll({
        
    })
}))