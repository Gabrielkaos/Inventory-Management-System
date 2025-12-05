const {validateSupplier} = require("../middleware/validation")
const express = require("express")
const { asyncHandler, AppError } = require("../middleware/errorHandler")
const authMiddleware = require("../middleware/auth")
const { Supplier } = require("../models/index")

const router = express.Router()


router.use(authMiddleware)

//get all suppliers
router.get("/", asyncHandler(async (req, res) => {
    const userId = req.user.userId
    
    const suppliers = await Supplier.findAll({
        where: { userId },
        order: [
            ["status", "DESC"], 
            ["name", "ASC"]
        ]
    })

    res.json({
        status: "success",
        results: suppliers.length,
        data: { suppliers }
    })
}))

//get single supplier
router.get("/:id", asyncHandler(async (req, res) => {
    const userId = req.user.userId
    const supplierId = req.params.id

    const supplier = await Supplier.findOne({
        where: { id: supplierId, userId }
    })

    if (!supplier) {
        throw new AppError("Supplier not found", 404)
    }

    res.json({
        status: "success",
        data: { supplier }
    })
}))

//create supplier
router.post("/", validateSupplier, asyncHandler(async (req, res) => {
    const userId = req.user.userId
    const { name, email, phone, address, contactPerson } = req.body

    const existingSupplier = await Supplier.findOne({
        where: { email, userId }
    })

    if (existingSupplier) {
        throw new AppError("Supplier with this email already exists", 400)
    }

    const supplier = await Supplier.create({
        name,
        email,
        phone: phone || null,
        address: address || null,
        contactPerson: contactPerson || null,
        userId
    })

    res.status(201).json({
        status: "success",
        message: "Supplier created successfully",
        data: { supplier }
    })
}))


router.put("/:id", validateSupplier, asyncHandler(async (req, res) => {
    const userId = req.user.userId
    const supplierId = req.params.id
    const { name, email, phone, address, contactPerson, status } = req.body

    const supplier = await Supplier.findOne({
        where: { id: supplierId, userId }
    })

    if (!supplier) {
        throw new AppError("Supplier not found", 404)
    }

    if (email !== supplier.email) {
        const existingSupplier = await Supplier.findOne({
            where: { 
                email, 
                userId,
                id: { [require("sequelize").Op.ne]: supplierId }
            }
        })

        if (existingSupplier) {
            throw new AppError("Supplier with this email already exists", 400)
        }
    }

    supplier.name = name
    supplier.email = email
    supplier.phone = phone || null
    supplier.address = address || null
    supplier.contactPerson = contactPerson || null
    if (status) supplier.status = status

    await supplier.save()

    res.json({
        status: "success",
        message: "Supplier updated successfully",
        data: { supplier }
    })
}))

router.delete("/:id", asyncHandler(async (req, res) => {
    const userId = req.user.userId
    const supplierId = req.params.id

    const supplier = await Supplier.findOne({
        where: { id: supplierId, userId }
    })

    if (!supplier) {
        throw new AppError("Supplier not found", 404)
    }

    await supplier.destroy()

    res.json({
        status: "success",
        message: "Supplier deleted successfully"
    })
}))

router.patch("/:id/toggle-status", asyncHandler(async (req, res) => {
    const userId = req.user.userId
    const supplierId = req.params.id

    const supplier = await Supplier.findOne({
        where: { id: supplierId, userId }
    })

    if (!supplier) {
        throw new AppError("Supplier not found", 404)
    }

    supplier.status = supplier.status === "active" ? "inactive" : "active"
    await supplier.save()

    res.json({
        status: "success",
        message: `Supplier ${supplier.status === "active" ? "activated" : "deactivated"} successfully`,
        data: { supplier }
    })
}))

module.exports = router