import pino from 'pino'
const logger = pino({
  level: process.env.REACT_APP_LOG_LEVEL
})

export default logger
