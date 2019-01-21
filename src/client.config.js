import { REACT_ENV,NETWORK } from 'react-native-dotenv'
//const paths = require('../config/paths');
var env = REACT_ENV
var network = NETWORK
console.log({env}) 
console.log({network}) 

//var path = './config/' + env + '/dev-'+network+'.json'
var path = './config/development/dev-kovan.json'
console.log({path})
debugger;
//var conf = paths.appConf;
var conf = require(path);
 
module.exports = conf;