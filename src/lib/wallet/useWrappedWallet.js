import GDStore from '../undux/GDStore'
import wrapper from '../undux/utils/wrapper'
import goodWallet from './GoodWallet'

export const useWrappedGoodWallet = () => {
  const store = GDStore.useStore()
  return wrapper(goodWallet, store)
}
