import UserStorage from './UserStorage'
import SimpleStore from '../undux/SimpleStore'
import wrapper from '../undux/utils/wrapper'

export const useWrappedUserStorage = () => {
  const store = SimpleStore.useStore()
  return wrapper(UserStorage, store)
}
