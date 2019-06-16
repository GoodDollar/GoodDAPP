// @flow
import type { Effects, Store } from 'undux'
import { AsyncStorage } from 'react-native'

const updateLoggedIn: Effects<State> = async (store: Store) => {
  const isLoggedIn = await AsyncStorage.getItem('GOODDAPP_isLoggedIn')
  const curStatus = store.get('isLoggedIn')
  if (isLoggedIn !== curStatus) store.set('isLoggedIn')(isLoggedIn)

  return store
}

export default updateLoggedIn
