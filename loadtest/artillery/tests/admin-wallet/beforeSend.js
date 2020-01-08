const fs = require("fs");
let random_data
let iteration = 0
const defaultData = {
  jwt: '',
  signature:
    '0x047526464c1deba2e052f4229b934b7b62a2db44e94dab695064d4b4df619596372406927800381693e534bf67e8843d3ebf4fc1f4155d5dd2fb1f0c093293a61b',
  gdSignature:
    '0xa5cd9c06504f39197ca09ea1d1b327db54cc4b755df29bba1dc0d8b4c1633d4b0abf5545814baad46205ed3385a819ee110a7ac4d2cd5191c57748c69dd5981a1c',
  profilePublickey: '153UfrV-Mcedw4BqZINxDkNObnuubDs8TyWMqOVcuPo.TOnHA_aU-gfzh8DEqH9ps97qc7PGGxZZffq9bFxgbsM',
  profileSignature:
    'SEA{"m":"Login to GoodDAPPb71f93cdbf86cfe11551","s":"eRQKfJYO2mFAl0pXrPoYPy/8oDpOc398gu34fl9exZfQ4gkaPzoHXA0NjkOmQx6uvwGthJkE8D9lUkZan/AhKw=="}',
  nonce: 'b71f93cdbf86cfe11551'
}

/**
 * Runs every time a request is sent
 * using in test.yml
 *
 * @param requestParams is an object given to the Request library. Use this parameter to customize what is sent in the request (headers, body, cookies etc)
 * @param context is the virtual user's context, context.vars is a dictionary containing all defined variables
 * @param ee is an event emitter that can be used to communicate with Artillery
 * @param next is the callback which must be called for the scenario to continue; it takes no arguments
 * @returns {Promise<*>}
 *
 *
 */
const setRandomParams = async (requestParams, context, ee, next) => {
 
  try {
    if (!random_data) {
      console.log('--------- read file random.data ------------')
      random_data = fs.readFileSync(`${__dirname}/random.data`, 'utf8');
      random_data = JSON.parse(random_data)
    }

  } catch (e) {
    console.log(e)
  }
  let cred

  if (random_data.length > 0) {
    if (!random_data[iteration]) {
      iteration = 0
    }
    cred = random_data[iteration]
    iteration++
  } else {
    cred = defaultData
  }
  
  requestParams.json = cred
  
  return next();
}

module.exports = {
  setRandomParams,
}

