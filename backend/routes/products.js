const jwt = require("jsonwebtoken")
const express = require("express")
const logger = require("../utils/logger")
const {asyncHandler} = require("../middleware/errorHandler")
const authMiddleWare = require("../middleware/auth")
const {Product, Category} = require("../models/index")
const { validateProduct } = require("../middleware/validation")

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

router.post("/",validateProduct,asyncHandler(async (req, res)=>{
    const userId = req.user.userId
    const {name, description, category, stock, unit} = req.body

    logger.info("Fetching products")
    const products = await Product.findAll({})

    logger.info("Fetching category")
    const fetchedCategory = await Category.findOne({where:{id:category}})

    logger.info("Creating Product")
    const product = await Product.create({
        name, description:description || "",categoryId:category, stock, unit,updatedBy:userId,
        uniqueCode:`${fetchedCategory.name}-${products.length}`,updatedBy:userId
    })

    logger.info("Product added")

    res.status(201).json({
        status:"success",
        message:"Product added",
        data:{
            product
        }
    })
}))


module.exports = router