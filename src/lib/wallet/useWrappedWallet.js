import goodWallet from './GoodWallet'
import SimpleStore from '../undux/SimpleStore'
import wrapper from '../undux/utils/wrapper'

export const useWrappedGoodWallet = () => {
  const store = SimpleStore.useStore()
  return wrapper(goodWallet, store)
}
