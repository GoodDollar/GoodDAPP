import { REACT_ENV, NETWORK } from 'react-native-dotenv'
import logger from './lib/logger/pino-logger'

const log = logger.child({ from: 'client.config' })

//const paths = require('../config/paths');
var env = REACT_ENV
var network = NETWORK
log.info({ env })
log.info({ network })

//var path = './config/' + env + '/dev-'+network+'.json'
var path = './config/development/dev-kovan.json'
log.info({ path })
debugger
//var conf = paths.appConf;
var conf = require(path)

module.exports = conf
