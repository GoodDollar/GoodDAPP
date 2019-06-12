import GDStore from '../undux/GDStore'
import wrapper from '../undux/utils/wrapper'
import userStorage from './UserStorage'

export const useWrappedUserStorage = () => {
  const store = GDStore.useStore()
  return wrapper(userStorage, store)
}
