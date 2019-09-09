// @flow
import type { Effects, Store } from 'undux'
import { AsyncStorage } from 'react-native'
import { IS_LOGGED_IN } from '../../constants/localStorage'

const updateLoggedIn: Effects<State> = async (store: Store) => {
  const isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN).then(JSON.parse)
  const curStatus = store.get('isLoggedIn')
  if (isLoggedIn !== curStatus) {
    store.set('isLoggedIn')(isLoggedIn)
  }

  return store
}

export default updateLoggedIn
