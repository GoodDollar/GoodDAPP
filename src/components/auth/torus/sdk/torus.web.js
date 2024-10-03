import { CustomAuth } from '@toruslabs/customauth'
import { defaults } from 'lodash'

// should be non-arrow function to be invoked with new
function Torus(Config, options) {
  const { torusRedirectUrl } = Config
  const popupMode = options.uxMode === 'popup'
  const baseUrl = torusRedirectUrl + (popupMode ? '/torus' : '')
  const redirectPathName = popupMode ? 'redirect' : 'Welcome/Auth'

  // setting values for url & redirect if  aren't overridden
  // doing this separately as we need to determine uxMode firstly
  const torusOptions = defaults({}, options, { baseUrl, redirectPathName })

  // as i remember baseUrl is web only - please re-check this
  return new CustomAuth(torusOptions)
}

export default Torus
