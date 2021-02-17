import DirectWebSDK from '@toruslabs/torus-direct-web-sdk'

// should be non-arrow function to be invoked with new
function Torus(Config, options) {
  // as i remember baseUrl is web only - please re-check this
  return new DirectWebSDK({ ...options })
}

export default Torus
