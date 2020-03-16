import { useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'

export default () => {
  const [isConnection, setIsConnection] = useState(true)

  NetInfo.fetch().then(({ isConnected }) => {
    setIsConnection(isConnected)
  })

  useEffect(() => {
    return NetInfo.addEventListener(({ isConnected }) => {
      setIsConnection(isConnected)
    })
  }, [NetInfo])

  return isConnection
}
