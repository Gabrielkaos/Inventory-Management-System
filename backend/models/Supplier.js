const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const Supplier = sequelize.define("Supplier", {
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
                msg: "Supplier name must be 2-100 characters"
            }
        }
    },

    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: "Must be a valid email address"
            }
        }
    },

    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    contactPerson: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "contact_person"
    },

    status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active"
    },

    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id"
    }

}, {
    tableName: "suppliers",
    underscored: true,
    timestamps: true,
    indexes: [
        {
            fields: ["user_id"]
        },
        {
            fields: ["status"]
        }
    ]
})

module.exports = Supplier