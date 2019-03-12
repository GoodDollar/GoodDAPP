import { updateAll } from '../utils/account'
import withBalanceChange from '../plugins/balanceChange'
import compose from 'lodash/fp/compose'

export const updateAllOnLoggedInCitizen = store =>
  store.on('isLoggedInCitizen').subscribe(isLoggedInCitizen => updateAll(store))

export default compose(
  updateAllOnLoggedInCitizen,
  withBalanceChange
)
