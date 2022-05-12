import { useDialog } from '../dialog/useDialog'
import { wrapper } from '../exceptions/utils'
import { useWallet } from './GoodWalletProvider'

export const useWrappedGoodWallet = () => {
  const { showDialog } = useDialog()
  const goodWallet = useWallet()

  return wrapper(goodWallet, showDialog)
}
