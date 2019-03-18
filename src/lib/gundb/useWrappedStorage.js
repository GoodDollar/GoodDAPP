import UserStorage from './UserStorage'
import GDStore from '../undux/GDStore'
import wrapper from '../undux/utils/wrapper'

export const useWrappedUserStorage = () => {
  const store = GDStore.useStore()
  return wrapper(UserStorage, store)
}
