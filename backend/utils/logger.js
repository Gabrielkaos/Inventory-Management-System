const winston = require("winston")
const path = require("path")


const logsDir = path.join(__dirname,'../logs')

const logFormat = winston.format.combine(
    winston.format.timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
    winston.format.errors({stack:true}),
    winston.format.splat(),
    winston.format.json()
)

const logger = winston.createLogger({
    level: 'info',
    format:logFormat,
    defaultMeta:{service:'inventory-api'},
    transports : [
        new winston.transports.File({
            filename:path.join(logsDir,'error.log'),
            level:'error',
            maxsize:5242880,
            maxFiles:5,
        }),

        new winston.transports.File({
            filename:path.join(logsDir,'combined.log'),
            maxsize:5242880,
            maxFiles:5,
        }),
    ]
})

if (process.env.ENV !== 'production'){
    logger.add(new winston.transports.Console({
        format:winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }))
}

module.exports = logger