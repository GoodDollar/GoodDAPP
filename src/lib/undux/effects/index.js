import updateAllOnLoggedInCitizen from './updateAllOnLoggedInCitizen'
import withBalanceChange from './balanceChange'
import compose from 'lodash/fp/compose'

export default compose(
  updateAllOnLoggedInCitizen,
  withBalanceChange
)
