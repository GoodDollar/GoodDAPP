import { getActiveChildNavigationOptions } from '@react-navigation/core'

export const navigationOptions = ({ navigation, screenProps }) => {
  const options = getActiveChildNavigationOptions(navigation, screenProps)
  const title = options.title
    ? options.title.indexOf('GoodDollar') > -1
      ? options.title
      : `GoodDollar | ${options.title}`
    : 'GoodDollar'
  return { title }
}

export const navigationConfig = { navigationOptions }
