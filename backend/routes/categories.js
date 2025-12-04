const express = require("express")
const { asyncHandler } = require("../middleware/errorHandler")
const {Category} = require("../models/index") 


router = express.Router()


router.get("/",asyncHandler(async (req, res)=>{
    const categories = await Category.findAll()

    res.json({
        status:"success",
        data:{categories}
    })
}))

module.exports = router