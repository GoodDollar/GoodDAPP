import compose from 'lodash/fp/compose'
import withBalanceChange from './balanceChange'
import withProfile from './profile'

export default compose(
  withBalanceChange,
  withProfile
)
