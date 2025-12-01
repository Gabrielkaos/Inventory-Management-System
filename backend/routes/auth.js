const express = require("express")
const {authLimiter} = require("../middleware/security")
const config = require("../config/config")
const logger = require("../utils/logger")
const {User} = require("../models/index")
const jwt = require("jsonwebtoken")
const { validateRegister, validateLogin } = require("../middleware/validation")
const { asyncHandler, AppError } = require("../middleware/errorHandler")


router = express.Router()


router.use(authLimiter)


//register new account
router.post("/register",validateRegister, asyncHandler(async (req, res)=>{
    const {username, email, password} = req.body

    //check if there is one already in db
    const existingUser = await User.findOne({
        where:{
            [require("sequelize").Op.or]: [{username},{email}]
        }
    })

    if (existingUser){
        throw new AppError("Username or email already exists")
    }

    logger.info("No existing user found, registering...")

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


router.post("/login",validateLogin,asyncHandler(async (req, res)=>{
    const {email, password} = req.body

    const user = await User.findOne({
        where: {email, isActive:true}
    })

    if(!user){
        throw new AppError("Invalid credentials",401)
    }

    const isMatch = await user.comparePassword(password)

    if(!isMatch){
        throw new AppError("Password doesnt match",401)
    }

    user.lastLogin = new Date()
    await user.save()

    const token = jwt.sign({userId:user.id,username:user.username, email}, config.jwt.secret,{expiresIn:config.jwt.expire})

    logger.info(`Login successful:${email}`)

    res.status(201).json({
        status:"success",
        message:"Login successful",
        data:{
            token, user:{id:user.id, username:user.username ,email}
        }
    })

}))

module.exports = router