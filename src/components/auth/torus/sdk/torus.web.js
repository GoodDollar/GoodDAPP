import DirectWebSDK from '@toruslabs/torus-direct-web-sdk'
import { omit } from 'lodash'

// should be non-arrow function to be invoked with new
function Torus(options) {
  return new DirectWebSDK(omit(options, 'redirectUri'))
}

export default Torus
