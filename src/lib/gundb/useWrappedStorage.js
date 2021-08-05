import SimpleStore from '../undux/SimpleStore'
import wrapper from '../undux/utils/wrapper'
// import userStorage from './UserStorage'
import userStorage from '../userStorage/UserStorage'
export const useWrappedUserStorage = () => {
  const store = SimpleStore.useStore()
  return wrapper(userStorage, store)
}
