const User = require("./User")
const Product = require("./Product")
const Category = require("./Category")
const Supplier = require("./Supplier")
const StockTransaction = require("./StockTransaction")


//product
Product.belongsTo(User, {
    foreignKey: "user_id",
    as: "owner"
})
User.hasMany(Product, {
    foreignKey: "user_id",
    as: "products"
})

//supplier

Supplier.belongsTo(User,{
    foreignKey:"user_id",
    as:"owner"
})

User.hasMany(Supplier,{
    foreignKey:"user_id",
    as:"suppliers"
})

//category

Product.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category"
})

Category.hasMany(Product, {
    foreignKey: "category_id",
    as: "products"
})

//transaction
StockTransaction.belongsTo(User,{
    foreignKey:"user_id",
    as:"owner"
})

User.hasMany(StockTransaction,{
    foreignKey:"user_id",
    as:"transactions"
})

StockTransaction.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product"
})

Product.hasMany(StockTransaction, {
    foreignKey: "product_id",
    as: "transactions"
})



module.exports = {User, Product, Category, Supplier, StockTransaction}
