const {Sequelize} = require("sequelize")
const logger = require("../utils/logger")


const sequelize = new Sequelize(process.env.DATABASE_URL,{
    dialect:'postgres',
    logging:(msg)=>logger.debug(msg),
    dialectOptions: {
        // ssl:process.env.ENV === 'production' ? {require:true, rejectUnauthorized:false}: false,
        ssl:{require:true, rejectUnauthorized:false}
    },
    pool:{
        max:5,
        min:0,
        acquire:30000,
        idle:10000
    }
})


const connectDB = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate()
      logger.info("PostgreSQL connected successfully")

      if (process.env.ENV === 'development') {
        await sequelize.sync({ alter: false })
        logger.info("Database models synchronized")
      }
      return;
    } catch (error) {
      logger.error(`Attempt ${i + 1} failed:`, error.message)
      if (i < retries - 1) {
        logger.info("Retrying in 3 seconds...")
        await new Promise(res => setTimeout(res, 3000))
      } else {
        logger.error("Unable to connect to PostgreSQL after multiple attempts")
        process.exit(1)
      }
    }
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