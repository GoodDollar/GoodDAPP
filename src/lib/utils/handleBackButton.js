import { BackHandler } from 'react-native'

let lastClick = 0

const handleBackButton = back => {
  const now = Date.now()
  if (now - lastClick <= 200) {
    return BackHandler.exitApp()
  }
  lastClick = Date.now()
  back()
}

export default handleBackButton
