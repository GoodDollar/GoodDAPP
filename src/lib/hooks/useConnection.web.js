import { useEffect, useState } from 'react'

export default () => {
  const [isConnection, setIsConnection] = useState(true)

  const updateOnlineStatus = () => {
    setIsConnection(navigator.onLine)
  }

  useEffect(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return isConnection
}
