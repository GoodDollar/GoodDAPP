import { useCallback } from 'react'
import usePropsRefs from '../hooks/usePropsRefs'
import { useUserStorage } from '../wallet/GoodWalletProvider'

export const onFeedReady = async userStorage => {
  const { feedStorage, initializedRegistered } = userStorage

  if (!initializedRegistered) {
    await feedStorage.ready
  }
}

const useFeedReady = () => {
  const userStorage = useUserStorage()
  const { initializedRegistered } = userStorage
  const [getStorage] = usePropsRefs([userStorage])

  const onReady = useCallback(async () => {
    await onFeedReady(getStorage())
  }, [getStorage])

  return [initializedRegistered, onReady]
}

export default useFeedReady
