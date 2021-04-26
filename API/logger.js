const winstonExpress = require('express-winston')

const {format, transports, createLogger} = require('winston');

const {printf, combine, timestamp} = format;

const logFormat = printf(({message, level, timestamp, meta}) => {
    return `${timestamp} ${level}: ${message}, req.query: ${JSON.stringify(meta.req.query)}, res.statusCode:${meta.res.statusCode}. `
})


const customLogFormat = printf(({message, level, timestamp}) => {
    return `${timestamp} ${level}: ${message}`
})


const errorLogFormat = printf(({level, timestamp, message, meta}) => {
    return `${timestamp} ${level}: ${message}, trace:\n ${meta.message}`
})

const logger = winstonExpress.logger({
    format: combine(timestamp(), logFormat),
    transports: [new transports.Console()],
});

const customLogger = createLogger({
    format: combine(timestamp(), customLogFormat),
    transports: [new transports.Console()],
})

const errorLogger = winstonExpress.errorLogger({
    format: combine(timestamp(), errorLogFormat),
    transports: [new transports.Console()],
})

module.exports = {logger, errorLogger, customLogger};