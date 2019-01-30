const logger = require('pino')({
  level: process.env.REACT_APP_LOG_LEVEL
})

export default logger
