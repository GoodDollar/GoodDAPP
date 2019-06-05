import { getActiveChildNavigationOptions } from '@react-navigation/core'

export const navigationOptions = ({ navigation, screenProps }) => {
  const options = getActiveChildNavigationOptions(navigation, screenProps)
  const title = options.title
    ? options.title.indexOf('Good Dollar') > -1
      ? options.title
      : `Good Dollar | ${options.title}`
    : 'Good Dollar'
  return { title }
}

export const navigationConfig = { navigationOptions }
