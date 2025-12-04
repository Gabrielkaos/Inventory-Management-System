const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const Category = sequelize.define("Category", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },

    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: {
                args: [1, 50],
                msg: "Category must be 1–50 characters long"
            }
        }
    }
}, {
    tableName: "categories",
    underscored: true,
    timestamps: true
})

module.exports = Category
