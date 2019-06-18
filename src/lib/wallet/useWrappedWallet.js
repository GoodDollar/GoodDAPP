import goodWallet from './GoodWallet'
import GDStore from '../undux/GDStore'
import wrapper from '../undux/utils/wrapper'

export const useWrappedGoodWallet = () => {
  const store = GDStore.useStore()
  return wrapper(goodWallet, store)
}
