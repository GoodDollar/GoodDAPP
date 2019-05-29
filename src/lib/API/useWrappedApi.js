import GDStore from '../undux/GDStore'
import wrapper from '../undux/utils/wrapper'
import API from './api'

export const useWrappedApi = () => {
  const store = GDStore.useStore()
  return wrapper(API, store)
}
