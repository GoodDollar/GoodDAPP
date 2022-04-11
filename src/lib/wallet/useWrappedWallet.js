import { useDialog } from '../dialog/useDialog'
import wrapper from '../undux/utils/wrapper'
import { useWallet } from './GoodWalletProvider'

export const useWrappedGoodWallet = () => {
  const { showDialog } = useDialog()
  const goodWallet = useWallet()
  return wrapper(goodWallet, showDialog)
}
