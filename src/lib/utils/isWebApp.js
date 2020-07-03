import { Platform } from 'react-native'

const isWebApp = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return false
  }

  if (window === undefined) {
    return false
  }

  return (
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true ||
    window.location.search.indexOf('?standalone') >= 0
  )
}

export default isWebApp()
