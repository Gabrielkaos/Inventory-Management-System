const express = require("express")
const { asyncHandler, AppError } = require("../middleware/errorHandler")
const authMiddleware = require("../middleware/auth")
const { StockTransaction, Product, User } = require("../models/index")
const { validateTransaction } = require("../middleware/validation")
const { sequelize } = require("../config/database")
const logger = require("../utils/logger")

const router = express.Router()


router.use(authMiddleware)

// Get all transactions for user
router.get("/", asyncHandler(async (req, res) => {
    const userId = req.user.userId
    logger.info("Fetching Transactions...")

    const transactions = await StockTransaction.findAll({
        where: { userId },
        include: [
            {
                model: Product,
                as: "product",
                attributes: ["id", "name", "unit"]
            },
            {
                model: User,
                as: "owner",
                attributes: ["id", "username"]
            }
        ],
        order: [["created_at", "DESC"]]
    })

    res.json({
        status: "success",
        results: transactions.length,
        data: { transactions }
    })
}))

// Get transactions for a specific product
router.get("/product/:productId", asyncHandler(async (req, res) => {
    const userId = req.user.userId
    const { productId } = req.params

    const transactions = await StockTransaction.findAll({
        where: { 
            userId, 
            productId 
        },
        include: [
            {
                model: Product,
                as: "product",
                attributes: ["id", "name", "unit"]
            },
            {
                model: User,
                as: "owner",
                attributes: ["id", "username"]
            }
        ],
        order: [["created_at", "DESC"]]
    })

    res.json({
        status: "success",
        results: transactions.length,
        data: { transactions }
    })
}))

// Get single transaction
router.get("/:id", asyncHandler(async (req, res) => {
    const userId = req.user.userId
    const transactionId = req.params.id

    const transaction = await StockTransaction.findOne({
        where: { id: transactionId, userId },
        include: [
            {
                model: Product,
                as: "product",
                attributes: ["id", "name", "unit"]
            },
            {
                model: User,
                as: "owner",
                attributes: ["id", "username"]
            }
        ]
    })

    if (!transaction) {
        throw new AppError("Transaction not found", 404)
    }

    res.json({
        status: "success",
        data: { transaction }
    })
}))

// Create new transaction
router.post("/", validateTransaction, asyncHandler(async (req, res) => {
    const userId = req.user.userId
    const { productId, type, quantity, referenceNumber, notes } = req.body

    // Use transaction to ensure data consistency
    const result = await sequelize.transaction(async (t) => {
        // Get product with lock
        const product = await Product.findOne({
            where: { id: productId, userId },
            lock: t.LOCK.UPDATE,
            transaction: t
        })

        if (!product) {
            throw new AppError("Product not found", 404)
        }

        // Store previous stock
        const previousStock = product.stock

        // Calculate new stock based on transaction type
        let newStock
        switch (type) {
            case "in":
            case "return":
                newStock = previousStock + quantity
                break
            case "out":
                if (previousStock < quantity) {
                    throw new AppError(
                        `Insufficient stock. Available: ${previousStock}, Required: ${quantity}`,
                        400
                    )
                }
                newStock = previousStock - quantity
                break
            case "adjustment":
                // For adjustments, quantity represents the adjustment amount
                // Positive = increase, Negative would need to be handled
                newStock = previousStock + quantity
                break
            default:
                throw new AppError("Invalid transaction type", 400)
        }

        // Update product stock
        product.stock = newStock
        
        // Update product status based on new stock
        if (newStock === 0) {
            product.status = "out-of-stock"
        } else if (product.status === "out-of-stock" && newStock > 0) {
            product.status = "active"
        }

        await product.save({ transaction: t })

        // Create transaction record
        const transaction = await StockTransaction.create({
            productId,
            type,
            quantity,
            previousStock,
            newStock,
            referenceNumber: referenceNumber || null,
            notes: notes || null,
            userId
        }, { transaction: t })

        return transaction
    })

    // Fetch complete transaction with associations
    const completeTransaction = await StockTransaction.findOne({
        where: { id: result.id },
        include: [
            {
                model: Product,
                as: "product",
                attributes: ["id", "name", "unit", "stock"]
            },
            {
                model: User,
                as: "owner",
                attributes: ["id", "username"]
            }
        ]
    })

    res.status(201).json({
        status: "success",
        message: "Transaction recorded successfully",
        data: { transaction: completeTransaction }
    })
}))

// Get transaction statistics
router.get("/stats/summary", asyncHandler(async (req, res) => {
    const userId = req.user.userId

    const [totalTransactions, stockIn, stockOut, adjustments] = await Promise.all([
        StockTransaction.count({ where: { userId } }),
        StockTransaction.sum("quantity", { where: { userId, type: "in" } }),
        StockTransaction.sum("quantity", { where: { userId, type: "out" } }),
        StockTransaction.count({ where: { userId, type: "adjustment" } })
    ])

    res.json({
        status: "success",
        data: {
            totalTransactions: totalTransactions || 0,
            totalStockIn: stockIn || 0,
            totalStockOut: stockOut || 0,
            totalAdjustments: adjustments || 0
        }
    })
}))

module.exports = router