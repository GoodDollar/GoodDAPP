// @flow
import type { Store } from 'undux'
import goodWallet from '../../wallet/GoodWallet'
import pino from '../../logger/pino-logger'
const log = pino.child({ from: 'withdraw' })

type ReceiptType = {
  transactionHash: string,
  transactionIndex: number,
  blockHash: string,
  blockNumber: number,
  from: string,
  to: string,
  status: boolean
}

export const executeWithdraw = async (store: Store, hash: string): Promise<ReceiptType> => {
  store.set('currentScreen')({
    ...store.get('currentScreen'),
    dialogData: {
      visible: true,
      title: 'Processing withrawal...',
      loading: true,
      dismissText: 'hold'
    }
  })

  try {
    const receipt = await goodWallet.withdraw(hash)
    store.set('currentScreen')({
      ...store.get('currentScreen'),
      dialogData: { visible: false }
    })
    return receipt
  } catch (e) {
    log.error({ e })
    store.set('currentScreen')({
      ...store.get('currentScreen'),
      dialogData: {
        visible: true,
        title: 'Error',
        message: e.message
      }
    })
    return {}
  }
}
