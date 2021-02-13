import AsyncStorage from './lib/utils/asyncStorage'
import { DESTINATION_PATH } from './lib/constants/localStorage'
import DeepLinking from './lib/utils/deepLinking'

export const savePathToStorage = async (params, log) => {
  let path = DeepLinking.pathname.slice(1)
  path = path.length === 0 ? 'AppNavigation/Dashboard/Home' : path

  // TODO: is this: path.indexOf('Marketplace') >= 0 really needed?
  if ((params && Object.keys(params).length > 0) || path.indexOf('Marketplace') >= 0) {
    const dest = { path, params }
    log.debug('Saving destination url', dest)
    await AsyncStorage.setItem(DESTINATION_PATH, dest)
  }
}
