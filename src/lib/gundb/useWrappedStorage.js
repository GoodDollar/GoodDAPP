import { useDialog } from '../dialog/useDialog'
import wrapper from '../undux/utils/wrapper'

import userStorage from './UserStorage'

export const useWrappedUserStorage = () => {
  const { showDialog } = useDialog()

  return wrapper(userStorage, showDialog)
}
