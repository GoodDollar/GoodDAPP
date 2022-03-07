import SimpleStore from '../undux/SimpleStore'
import wrapper from '../undux/utils/wrapper'
import { useWallet } from './GoodWalletProvider'

export const useWrappedGoodWallet = () => {
  const store = SimpleStore.useStore()
  const goodWallet = useWallet()
  return wrapper(goodWallet, store)
}
