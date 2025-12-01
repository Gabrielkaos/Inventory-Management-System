const express = require("express")
const {authLimiter} = require("../middleware/security")
const config = require("../config/config")
const logger = require("../utils/logger")
const {User} = require("../models/index")
const jwt = require("jsonwebtoken")
const { validateRegister } = require("../middleware/validation")
const { asyncHandler, AppError } = require("../middleware/errorHandler")


router = express.router()


router.use(authLimiter)


//register new account
router.post("/register",validateRegister, asyncHandler(async (req, res)=>{
    const {username, email, password} = req.body

    //check if there is one already in db
    const existingUser = User.findOne({
        where:{
            [require("sequelize").Op.or]: [{username},{email}]
        }
    })

    if (existingUser){
        throw new AppError("Username or email already exists")
    }

    const user = User.create({
        username, email, password
    })

    const token = jwt.sign({userId:user.id,username, email}, config.jwt.secret,{expiresIn:config.jwt.expire})

    logger.info(`New user registered:${username}`)

    res.status(201).json({
        status:"success",
        message:"New user registered",
        data:{
            token, user:{id:user.id, username, email}
        }
    })
}))