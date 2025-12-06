const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const StockTransaction = sequelize.define("StockTransaction", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },

    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "product_id",
        references: {
            model: "products",
            key: "id"
        }
    },

    type: {
        type: DataTypes.ENUM("in", "out", "adjustment", "return"),
        allowNull: false,
        comment: "in=receive, out=sale/issue, adjustment=correction, return=customer/supplier return"
    },

    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: "Quantity must be at least 1"
            }
        }
    },

    previousStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "previous_stock",
        comment: "Stock level before this transaction"
    },

    newStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "new_stock",
        comment: "Stock level after this transaction"
    },

    referenceNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "reference_number",
        comment: "PO number, invoice number, etc."
    },

    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Additional notes or reason for transaction"
    },

    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
        comment: "User who recorded this transaction"
    }

}, {
    tableName: "stock_transactions",
    underscored: true,
    timestamps: true,
    updatedAt: false, 
    indexes: [
        {
            fields: ["product_id"]
        },
        {
            fields: ["type"]
        },
        {
            fields: ["user_id"]
        },
        {
            fields: ["created_at"]
        }
    ]
})

module.exports = StockTransaction