import { useEffect, useState } from 'react'
import { addEventListener, fetch } from '@react-native-community/netinfo'

export default () => {
  const [isConnection, setIsConnection] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = ({ isConnected }) => setIsConnection(isConnected)

    fetch().then(updateOnlineStatus)
    return addEventListener(updateOnlineStatus)
  }, [setIsConnection])

  return isConnection
}
