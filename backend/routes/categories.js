const express = require("express")
const { asyncHandler, AppError } = require("../middleware/errorHandler")
const { Category, Product } = require("../models/index") 
const { validateProductID, validateCategory } = require("../middleware/validation")

const router = express.Router()


//get all categories
router.get("/", asyncHandler(async (req, res) => {
    const categories = await Category.findAll({
        order: [["name", "ASC"]]
    })

    res.json({
        status: "success",
        results: categories.length,
        data: { categories }
    })
}))

//get single category
router.get("/:id", validateProductID, asyncHandler(async (req, res) => {
    const categoryId = req.params.id
    const category = await Category.findOne({ 
        where: { id: categoryId }
    })

    if (!category) {
        throw new AppError("Category not found", 404)
    }

    res.status(200).json({
        status: "success",
        category
    })
}))

//create new category
router.post("/", validateCategory, asyncHandler(async (req, res) => {
    const { name } = req.body

    
    const existingCategory = await Category.findOne({
        where: { name }
    })

    if (existingCategory) {
        throw new AppError("Category already exists", 400)
    }

    const category = await Category.create({ name })

    res.status(201).json({
        status: "success",
        message: "Category created successfully",
        data: { category }
    })
}))

//update category
router.put("/:id", validateProductID, validateCategory, asyncHandler(async (req, res) => {
    const categoryId = req.params.id
    const { name } = req.body

    const category = await Category.findOne({
        where: { id: categoryId }
    })

    if (!category) {
        throw new AppError("Category not found", 404)
    }

    const existingCategory = await Category.findOne({
        where: { 
            name,
            id: { [require("sequelize").Op.ne]: categoryId }
        }
    })

    if (existingCategory) {
        throw new AppError("Category name already exists", 400)
    }

    category.name = name
    await category.save()

    res.json({
        status: "success",
        message: "Category updated successfully",
        data: { category }
    })
}))

//delete category
router.delete("/:id", validateProductID, asyncHandler(async (req, res) => {
    const categoryId = req.params.id

    const category = await Category.findOne({
        where: { id: categoryId }
    })

    if (!category) {
        throw new AppError("Category not found", 404)
    }

    const productCount = await Product.count({
        where: { categoryId }
    })

    if (productCount > 0) {
        // await Product.update(
        //     { categoryId: null },
        //     { where: { categoryId } }
        // )
        throw new AppError("Can't delete there are products connected to this category",400)
    }

    await category.destroy()

    res.json({
        status: "success",
        message: "Category deleted successfully"
    })
}))

module.exports = router