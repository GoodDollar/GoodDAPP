import API from './api'
import GDStore from '../undux/GDStore'
import wrapper from '../undux/utils/wrapper'

export const useWrappedApi = () => {
  const store = GDStore.useStore()
  return wrapper(API, store)
}
