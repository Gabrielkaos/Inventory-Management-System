const {body, param, validationResult} = require("express-validator")



const validate = async (req, res, next) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({
            error:"validation error",
            details:errors.array()
        })
    }
    next()
}

const validateSupplier = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Supplier name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Supplier name must be 2-100 characters"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Must be a valid email address"),
    body("phone")
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage("Phone must be less than 20 characters"),
    body("contactPerson")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Contact person must be less than 100 characters"),
    body("status")
        .optional()
        .isIn(["active", "inactive"])
        .withMessage("Status must be either 'active' or 'inactive'"),
    validate
]

const validateCategory = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Category name is required")
        .isLength({ min: 1, max: 50 })
        .withMessage("Category name must be 1-50 characters"),
    validate
]

const validateRegister = [
    body("username")
        .trim()
        .isLength({min:3,max:30})
        .withMessage("Username must be between 3 and 30 characters long")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username can only contain letters, numbers, and underscores"),
    
    body("email")
        .isEmail()
        .withMessage("Provide a proper email address"),

    body("password")
        .isLength({min:8})
        .withMessage("Password length must be equal or greather than 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must include at least one upper case letter, one lower case, and one number"),
    
    validate
]

const validateLogin = [
    body("email")
        .isEmail()
        .withMessage("Provide a proper email address"),

    body("password")
        .isLength({min:8})
        .withMessage("Password length must be equal or greather than 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must include at least one upper case letter, one lower case, and one number"),
    
    validate
]

const validateProduct = [
    body("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Product name must be 2-100 characters long"),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string"),

    body("unit")
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage("Unit is required and must be 1-20 characters long"),

    body("stock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),

    body("status")
        .optional()
        .isIn(["active", "discontinued", "out-of-stock"])
        .withMessage("Status must be one of 'active', 'discontinued', 'out-of-stock'"),

    body("categoryId")
        .isUUID()
        .withMessage("Category must be a valid UUID"),

    body("userId")
        .optional()
        .isUUID()
        .withMessage("userId must be a valid UUID"),

    validate
]

const validateProductID = [
    param('id')
        .isUUID()
        .withMessage("Invalid Product ID"),
    validate
]

module.exports = {validateRegister, validateLogin, validateProduct, validateProductID, validateCategory, validateSupplier}