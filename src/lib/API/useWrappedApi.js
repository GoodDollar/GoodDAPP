import SimpleStore from '../undux/SimpleStore'
import wrapper from '../undux/utils/wrapper'
import API from './api'

export const useWrappedApi = () => {
  const store = SimpleStore.useStore()
  return wrapper(API, store)
}
