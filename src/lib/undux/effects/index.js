import compose from 'lodash/fp/compose'

import updateAllOnLoggedInCitizen from './updateAllOnLoggedInCitizen'
import withBalanceChange from './balanceChange'
import withProfile from './profile'
import updateFeedList from './updateFeedList'

export default compose(
  updateAllOnLoggedInCitizen,
  withBalanceChange,
  withProfile,
  updateFeedList
)
