import SimpleStore from '../undux/SimpleStore'
import wrapper from '../undux/utils/wrapper'

import { useUserStorage } from '../wallet/GoodWalletProvider'

export const useWrappedUserStorage = () => {
  const store = SimpleStore.useStore()
  const userStorage = useUserStorage()

  return wrapper(userStorage, store)
}
