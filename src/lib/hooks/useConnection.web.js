import { useEffect, useState } from 'react'

export default () => {
  const [isConnection, setIsConnection] = useState(true)

  useEffect(() => {
    const events = ['online', 'offline']
    const updateOnlineStatus = () => setIsConnection(navigator.onLine)

    events.forEach(event => window.addEventListener(event, updateOnlineStatus))

    return () => {
      events.forEach(event => window.removeEventListener(event, updateOnlineStatus))
    }
  }, [setIsConnection])

  return isConnection
}
