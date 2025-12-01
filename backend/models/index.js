const User = require("./User")
const Product = require("./Product")

Product.belongsTo(User, {
    foreignKey: "user_id",
    as: "owner"
})
User.hasMany(Product, {
    foreignKey: "user_id",
    as: "products"
})

Product.belongsTo(User, {
    foreignKey: "updated_by",
    as: "updatedByUser"
})


module.exports = {User, Product}
