const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const Product = sequelize.define("Product", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: {
                args: [2, 100],
                msg: "Product name must be 2-100 characters"
            }
        }
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    uniqueCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "unique_code"
    },

    categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "category_id"
    },

    unit: {
        type: DataTypes.STRING(20),  
        allowNull: false             
    },

    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: {
                args: [0],
                msg: "Stock cannot be negative"
            }
        }
    },

    status: {
        type: DataTypes.ENUM("active", "discontinued", "out-of-stock"),
        allowNull: false,
        defaultValue: "active"
    },

    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "user_id"
    },

    supplierId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "supplier_id",
        references:{
            model:"suppliers",
            key:"id"
        }
    }

}, {
    tableName: "products",
    underscored: true,
    timestamps: true,            
})

module.exports = Product
