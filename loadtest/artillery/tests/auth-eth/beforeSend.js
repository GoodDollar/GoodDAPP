const fs = require("fs");
const defaultData = {
  jwt: '',
  signature:
    '0xaa4eb02d727ab09e6621060f26cff3ceecb3a0901b4f7de564490646482ced3c1c18bf310509a0d3ef7b622c458083a2dce27b3763714bb10d82f53bdb6559a21c',
  gdSignature:
    '0xaa4eb02d727ab09e6621060f26cff3ceecb3a0901b4f7de564490646482ced3c1c18bf310509a0d3ef7b622c458083a2dce27b3763714bb10d82f53bdb6559a21c',
  profilePublickey: 'lK-f6i-QPHwyxxUOKc4uaubfpTC1TW8oLLCRmv9z9tU.CjtOQSI2XqitheQZLdVlHc09gkm_d2IRz4LRAL6GmFU',
  profileSignature:
    'SEA{"m":"Login to GoodDAPP","s":"tNknsunS9psSLQDr/nFeobeHWdROtu3kEHgjHFSkreLFkgmHJPy/E3fm6llN1QOsNtfE12WTs4k1mOEE/H1AWw=="}',
  nonce: ''
}
let random_data
let iteration = 0
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
    if (~random_data[iteration]) {
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

