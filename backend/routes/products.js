const jwt = require("jsonwebtoken")
const express = require("express")
const logger = require("../utils/logger")
const {asyncHandler, AppError} = require("../middleware/errorHandler")
const authMiddleWare = require("../middleware/auth")
const {Product, Category, Supplier} = require("../models/index")
const { validateProduct, validateProductID } = require("../middleware/validation")

router = express.Router()



router.use(authMiddleWare)

//Get all products
router.get("/", asyncHandler(async (req, res)=>{
    const userId = req.user.userId
    const products = await Product.findAll({
        where:{userId:userId},
        order:[
            ["updated_at","DESC"],
            ["created_at","DESC"]
        ],
        include:[
            {
                model:Category,
                as:"category",
                attributes:["id","name"]
            },
            {
                model:Supplier,
                as:"supplier",
                attributes:["id","name"]
            }
        ]
    })

    res.json({
        status:"success",
        results:products.length,
        data:{products}
    })
}))

//get single product
router.get("/:id",validateProductID,asyncHandler( async (req, res)=>{
    const userId = req.user.userId
    const productId = req.params.id

    const product = await Product.findOne({
        where:{id:productId,userId},
        include:[
            {
                model:Category,
                as:"category",
                attributes:["id","name"]
            },
            {
                model:Supplier,
                as:"supplier",
                attributes:["id","name"]
            }
        ]
    })

    if(!product){
        throw new AppError("Product not found",404)
    }

    res.json({
        status:"success",
        data:{product}
    })
}))

//Create Product
router.post("/",validateProduct,asyncHandler(async (req, res)=>{
    const userId = req.user.userId
    const {name, description, categoryId, stock, unit, supplierId} = req.body

    
    const fetchedCategory = await Category.findOne({where:{id:categoryId}})
    if(!fetchedCategory){
        throw new AppError("No category match found",400)
    }

    const fetchedSupplier = await Supplier.findOne({where:{id:supplierId}})
    if(!fetchedSupplier){
        throw new AppError("No supplier match found",400)
    }

    const uniqueCode = `${fetchedCategory.name}-${Date.now().toString(36).toUpperCase()}`

    const product = await Product.create({
        name, 
        description:description || "",
        categoryId, 
        stock, 
        unit,
        uniqueCode,
        userId,
        supplierId
    })

    res.status(201).json({
        status:"success",
        message:"Product added",
        data:{
            product
        }
    })
}))


//Update Product
router.put("/:id",validateProductID,asyncHandler(async (req, res)=>{
    const userId = req.user.userId
    const productId = req.params.id
    const {name, description, categoryId, stock, unit, supplierId} = req.body

    //find the product first
    const product = await Product.findOne({
        where:{userId,id:productId}
    })
    if(!product){
        throw new AppError("Product not found",404)
    }

    if(categoryId){

        const fetchedCategory = await Category.findOne({where:{id:categoryId}})
        if(!fetchedCategory)throw new AppError("Category not found",404)
        product.categoryId = categoryId
        const uniqueCode = `${fetchedCategory.name}-${Date.now().toString(36).toUpperCase()}`
        product.uniqueCode = uniqueCode
    }

    if(supplierId){

        const fetchedSupplier = await Supplier.findOne({where:{id:supplierId}})
        if(!fetchedSupplier)throw new AppError("Supplier not found",404)
        product.supplierId = supplierId
    }

    if(name !== undefined || name != "")product.name=name
    if(description !== undefined || description != "")product.description=description
    if(stock !== undefined || stock != "")product.stock=stock
    if(unit !== undefined || unit != "")product.unit=unit

    await product.save()

    res.json({
        status:"success",
        message:"Updated successfully",
        data:{product}
    })
    
}))

router.delete("/:id",validateProductID,asyncHandler(async (req, res)=>{
    const userId = req.user.userId
    const productId = req.params.id

    const product = await Product.findOne({where:{userId,id:productId}})
    if(!product)throw new AppError("No product found",404)

    await product.destroy()

    res.json({
        status:"success",
        message:"Deleted successfully"
    })
}))

module.exports = router