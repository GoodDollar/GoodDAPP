import SimpleStore from '../undux/SimpleStore'
import wrapper from '../undux/utils/wrapper'
import goodWallet from './GoodWallet'

export const useWrappedGoodWallet = () => {
  const store = SimpleStore.useStore()
  return wrapper(goodWallet, store)
}
