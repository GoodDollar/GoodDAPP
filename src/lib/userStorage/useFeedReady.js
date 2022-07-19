import { useEffect } from 'react'
import usePromise from '../hooks/usePromise'
import { useUserStorage } from '../wallet/GoodWalletProvider'

// eslint-disable-next-line require-await
export const onFeedReady = async userStorage =>
  new Promise(resolve => {
    const checkReady = () => {
      const { initializedRegistered, feedStorage } = userStorage

      if (initializedRegistered) {
        feedStorage.ready.then(resolve)
        return
      }

      setTimeout(checkReady)
    }

    checkReady()
  })

const useFeedReady = () => {
  const userStorage = useUserStorage()
  const { initializedRegistered, feedStorage } = userStorage
  const [onReady, setReady] = usePromise()

  useEffect(() => {
    if (initializedRegistered) {
      feedStorage.ready.then(setReady)
    }
  }, [setReady, feedStorage, initializedRegistered])

  return [initializedRegistered, onReady]
}

export default useFeedReady
