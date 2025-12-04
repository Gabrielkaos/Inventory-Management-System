const express = require("express")
const { asyncHandler, AppError } = require("../middleware/errorHandler")
const {Category} = require("../models/index") 
const {validateProductID} = require("../middleware/validation")

router = express.Router()


router.get("/",asyncHandler(async (req, res)=>{
    const categories = await Category.findAll()

    res.json({
        status:"success",
        data:{categories}
    })
}))


router.get("/:id", validateProductID, asyncHandler(async (req, res)=>{
    const categoryId = req.params.id
    const category = Category.findOne({where:{id:categoryId}})

    if(!category){
        throw new AppError("Category not found",404)
    }

    res.status(200).json({
        category
    })
}))

module.exports = router