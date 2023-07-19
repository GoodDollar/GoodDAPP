// @flow

import { chunk, map, max, pick, values } from 'lodash'
import moment from 'moment'
import api from '../../API/api'
import { NETWORK_ID } from '../../constants/network'
import { FeedSource } from '../feed'
import type { TransactionEvent } from '../../userStorage/UserStorageClass'
import { FeedItemType, TxStatus } from '../../userStorage/FeedStorage'
import { getNativeToken } from '../../wallet/utils'

const SYNC_CHAINS = values(pick(NETWORK_ID, 'FUSE', 'CELO', 'MAINNET', 'GOERLI'))
const LAST_BLOCK_ITEM = 'GD_lastNativeTxsBlock'
const TX_CHUNK = 20

const { COMPLETED } = TxStatus
const { EVENT_TYPE_SENDNATIVE, EVENT_TYPE_RECEIVENATIVE } = FeedItemType

export default class NativeTxsSource extends FeedSource {
  async syncFromRemote() {
    const { db, Feed, log, storage } = this
    const address = db.wallet.account

    const lastBlock = await storage.getItem(LAST_BLOCK_ITEM)

    log.info('Native transactions sync started', { lastBlock, address })

    const result = await SYNC_CHAINS.reduce(
      (promise, chainId) =>
        promise.then(async ({ txs, maxBlock }) => {
          const token = getNativeToken(chainId)
          const chainTxs = await this.queryTxs(chainId, lastBlock)

          log.info('Got native transactions', { chainTxs, chainId })

          return {
            txs: txs.concat(chainTxs.map(tx => this.formatTx(chainId, token, tx))),
            maxBlock: Math.max(maxBlock, chainTxs.length ? max(map(chainTxs, 'blockNumber').map(Number)) : 0),
          }
        }),
      Promise.resolve({ txs: [], maxBlock: 0 }),
    )

    log.info('Processed native transactions', result)

    if (!lastBlock) {
      // replacing the whole tx feed with the new one if no last block was stored
      await Promise.all([EVENT_TYPE_RECEIVENATIVE, EVENT_TYPE_SENDNATIVE].map(type => Feed.find({ type }).delete()))
    }

    const { txs, maxBlock } = result

    if (txs.length) {
      // storing txs in the feed by the chunks
      await chunk(txs, TX_CHUNK).reduce((promise, txs) => promise.then(() => Feed.save(...txs)), Promise.resolve())
      log.info('Stored new native transactions in the feed', { txs })
    }

    if (maxBlock) {
      await storage.setItem(LAST_BLOCK_ITEM, maxBlock)
      log.info('Last native transactions block updated', { lastBlock: maxBlock })
    }

    log.info('Native transactions sync done')
  }

  /** @private */
  // eslint-disable-next-line require-await
  async queryTxs(chainId, lastBlock = undefined) {
    const { account } = this.db.wallet
    const fromBlock = lastBlock ? lastBlock + 1 : undefined

    if (chainId === NETWORK_ID.FUSE) {
      return api.fuseExplorerQuery(account, fromBlock)
    }

    return api.tatumQuery(account, chainId, fromBlock)
  }

  /** @private */
  getTxData(chainId, token, tx) {
    if (chainId === NETWORK_ID.FUSE) {
      return this.getFuseTxData(tx)
    }

    const { wallet } = this.db
    const { address, amount, counterAddress, timestamp, transactionSubtype } = tx
    const isSend = transactionSubtype === 'outgoing'
    const value = amount && amount.startsWith('-') ? amount.substring(1) : amount

    const receipt = {
      [isSend ? 'to' : 'from']: counterAddress,
      amount: wallet.fromDecimals(value, token),
    }

    return {
      timestamp,
      isSend,
      address,
      receipt,
    }
  }

  /** @private */
  getFuseTxData(tx) {
    const { account } = this.db.wallet
    const { from, to, timeStamp, value } = tx
    const isSend = from === account.toLowerCase()
    const address = isSend ? from : to

    const receipt = {
      ...(isSend ? { to } : { from }),
      amount: value,
    }

    return {
      timestamp: Number(timeStamp) * 1000, // from sec to ms
      isSend,
      address,
      receipt,
    }
  }

  /** @private */
  formatTx(chainId, token, tx): TransactionEvent {
    const { hash } = tx
    const { timestamp, isSend, address, receipt } = this.getTxData(chainId, token, tx)

    const date = moment(timestamp)
      .utc()
      .format()

    return {
      _id: hash,
      id: hash,
      date,
      createdDate: date,
      type: isSend ? EVENT_TYPE_SENDNATIVE : EVENT_TYPE_RECEIVENATIVE,
      receiptReceived: true,
      status: COMPLETED,
      otplStatus: COMPLETED,
      chainId,
      data: {
        asset: token,
        ...receipt,
        receiptEvent: {
          ...receipt,
          txHash: hash,
          eventSource: address,
        },
      },
    }
  }
}
