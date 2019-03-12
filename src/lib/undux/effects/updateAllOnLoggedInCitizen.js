// @flow
import type { Effects, Store } from 'undux'
import type { State } from '../GDStore'

import { updateAll } from '../utils/account'

const updateAllOnLoggedInCitizen: Effects<State> = (store: Store) =>
  store.on('isLoggedInCitizen').subscribe(isLoggedInCitizen => updateAll(store))

export default updateAllOnLoggedInCitizen
