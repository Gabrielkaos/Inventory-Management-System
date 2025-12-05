const User = require("./User")
const Product = require("./Product")
const Category = require("./Category")
const Supplier = require("./Supplier")

Product.belongsTo(User, {
    foreignKey: "user_id",
    as: "owner"
})
User.hasMany(Product, {
    foreignKey: "user_id",
    as: "products"
})

Supplier.belongsTo(User,{
    foreignKey:"user_id",
    as:"owner"
})

User.hasMany(Supplier,{
    foreignKey:"user_id",
    as:"suppliers"
})

Product.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category"
})

Category.hasMany(Product, {
    foreignKey: "category_id",
    as: "products"
})


module.exports = {User, Product, Category, Supplier}
