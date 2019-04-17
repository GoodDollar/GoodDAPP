import compose from 'lodash/fp/compose'

import updateAllOnLoggedInCitizen from './updateAllOnLoggedInCitizen'
import withBalanceChange from './balanceChange'
import withProfile from './profile'

export default compose(
  updateAllOnLoggedInCitizen,
  withBalanceChange,
  withProfile
)
