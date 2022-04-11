import { useDialog } from '../dialog/useDialog'
import wrapper from '../undux/utils/wrapper'

import { useUserStorage } from '../wallet/GoodWalletProvider'

export const useWrappedUserStorage = () => {
  const { showDialog } = useDialog()
  const userStorage = useUserStorage()

  return wrapper(userStorage, showDialog)
}
