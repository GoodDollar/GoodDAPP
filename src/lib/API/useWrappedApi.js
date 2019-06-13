import API from './api'
import SimpleStore from '../undux/SimpleStore'
import wrapper from '../undux/utils/wrapper'

export const useWrappedApi = () => {
  const store = SimpleStore.useStore()
  return wrapper(API, store)
}
