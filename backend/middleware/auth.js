const jwt = require("jsonwebtoken")


const authMiddleWare = (req, res, next)=>{
    try{
        const token = req.header("Authorization")?.replace("Bearer ","")

        if(!token){
            return res.status(401).json({error:"Invalid token"})
        }

        const decoded = jwt.decode(token,process.env.JWT_SECRET)

        req.user = decoded

        next()
    }catch(error){
        res.status(401).json({error:"Invalid token"})
    }
}


module.exports = authMiddleWare