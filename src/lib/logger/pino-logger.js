import { LOG_LEVEL } from 'react-native-dotenv'

const logger = require('pino')({
  level: LOG_LEVEL
})

export default logger
