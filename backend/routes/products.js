const jwt = require("jsonwebtoken")
const express = require("express")
const logger = require("../utils/logger")
const {asyncHandler} = require("../middleware/errorHandler")
const authMiddleWare = require("../middleware/auth")
const {Product} = require("../models/index")

router = express.Router()



router.use(authMiddleWare)


router.get("/", asyncHandler(async (req, res)=>{
    const userId = req.user.userId
    const products = await Product.findAll({
        where:{updatedBy:userId},
        order:[
            ["updated_at","DESC"],
            ["created_at","DESC"]
        ]
    })

    res.json({
        status:"success",
        results:products.length,
        data:{products}
    })
}))


module.exports = router