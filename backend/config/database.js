const {Sequelize} = require("sequelize")
const logger = require("../utils/logger")


const sequelize = new Sequelize(process.env.DATABASE_URL,{
    dialect:'postgres',
    logging:(msg)=>logger.debug(msg),
    dialectOptions: {
        ssl:process.env.ENV === 'production' ? {require:true, rejectUnauthorized:false}: false
    },
    pool:{
        max:5,
        min:0,
        acquire:30000,
        idle:10000
    }
})


const connectDB = async () => {
    try{
        await sequelize.authenticate()
        logger.info("PostgreSQL connected successfully")

        if(process.env.ENV === 'development'){
            await sequelize.sync({alter:false})
            logger.info("Database models synchronized")
        }

    }catch(error){
        logger.error('Unable to connect to PostgreSQL',error.message)
        process.exit(1)
    }
}


process.on('SIGINT', async ()=>{
    try{
        await sequelize.close()
        logger.info("PostgreSQL connection closed")
        process.exit(0)
    }catch(error){
        logger.error('Error closing PostgreSQL',error.message)
        process.exit(1)
    }
})

module.exports = {sequelize, connectDB}