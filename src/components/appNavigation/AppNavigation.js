// @flow
import { createSwitchNavigator } from '@react-navigation/core'
import React, { useCallback } from 'react'
import type { Store } from 'undux'

import { pickBy } from 'lodash'
import Dashboard from '../dashboard/Dashboard'
import Profile from '../profile/Profile'
import LoginRedirect from '../loginRedirect/LoginRedirect'
import logger from '../../lib/logger/js-logger'
import { useNotifications } from '../../lib/notifications/hooks/useNotifications.native'
import { NotificationsCategories } from '../../lib/notifications/constants'
import { fireEvent, NOTIFICATION_ERROR, NOTIFICATION_TAPPED } from '../../lib/analytics/analytics'
import usePropsRefs from '../../lib/hooks/usePropsRefs'
import { isWeb } from '../../lib/utils/platform'
import { navigationOptions } from './navigationConfig'

/**
 * @type
 */
type AppNavigationProps = {
  navigation: any,
  store: Store,
}

const log = logger.child({ from: 'stackNavigation' })

const routes = {
  Dashboard: {
    screen: Dashboard,
    display: false,
  },
  Profile: {
    screen: Profile,
    display: false,
  },
  LoginRedirect: {
    screen: LoginRedirect,
    display: false,
  },
}

const initialRouteName = 'Dashboard'
const AppNavigator = createSwitchNavigator(routes, { initialRouteName })

/**
 * Switch navigation between all screens on the tabs. Each of this screen should be a StackNavigation
 * Dashboard is the initial route
 * @param {AppNavigationProps} props
 */
const AppNavigation = ({ navigation }: AppNavigationProps) => {
  const [getNavigation] = usePropsRefs([navigation])

  const onOpened = useCallback(
    (notification, category) => {
      const { navigate } = getNavigation()
      const { payload } = notification || {}
      try {
        switch (category) {
          case NotificationsCategories.CLAIM_NOTIFICATION:
            navigate('Claim')
            break
          default:
            throw new Error('Unknown / unsupported notification received')
        }

        fireEvent(NOTIFICATION_TAPPED, pickBy({ payload }))
      } catch (e) {
        const { message: error } = e

        log.error('Failed to process notification', error, e, { payload })
        fireEvent(NOTIFICATION_ERROR, pickBy({ payload, error }))
      }
    },
    [getNavigation],
  )

  if (!isWeb) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useNotifications(onOpened)
  }

  return <AppNavigator navigation={navigation} screenProps={{ routes }} />
}

AppNavigation.router = AppNavigator.router
AppNavigation.navigationOptions = navigationOptions

export default AppNavigation
