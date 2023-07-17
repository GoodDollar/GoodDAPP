// @flow

import { chunk, map, max, pick, values } from 'lodash'
import moment from 'moment'
import api from '../../API/api'
import { NETWORK_ID } from '../../constants/network'
import { FeedSource } from '../feed'
import type { TransactionEvent } from '../../userStorage/UserStorageClass'
import { FeedItemType, TxStatus } from '../../userStorage/FeedStorage'
import { getNativeToken } from '../../wallet/utils'

const SYNC_CHAINS = values(pick(NETWORK_ID, 'CELO', 'MAINNET', 'GOERLI'))
const LAST_BLOCK_ITEM = 'GD_lastTatumBlock'
const TX_CHUNK = 20

const { COMPLETED } = TxStatus
const { EVENT_TYPE_SENDNATIVE, EVENT_TYPE_RECEIVENATIVE } = FeedItemType

export default class TatumSource extends FeedSource {
  static formatTatumTx(chainId, token, tx): TransactionEvent {
    const { address, amount, counterAddress, hash, timestamp, transactionSubtype } = tx
    const date = moment(timestamp)
      .utc()
      .format()
    const isSend = transactionSubtype === 'outgoing'

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
        [isSend ? 'to' : 'from']: counterAddress,
        amount,
        receiptEvent: {
          txHash: hash,
          eventSource: address,
        },
      },
    }
  }

  async syncFromRemote() {
    const { formatTatumTx } = TatumSource
    const { db, Feed, log, storage } = this
    const { address } = db

    const lastBlock = await storage.getItem(LAST_BLOCK_ITEM)

    log.info('Tatum sync started', { lastBlock, address })

    const result = await SYNC_CHAINS.reduce(
      (promise, chainId) =>
        promise.then(async ({ txs, maxBlock }) => {
          const token = getNativeToken(chainId)
          const chainTxs = await api.tatumQuery(address, chainId, lastBlock ? lastBlock + 1 : undefined)

          log.info('Tatum got txs', { chainTxs, chainId })

          return {
            txs: txs.concat(chainTxs.map(tx => formatTatumTx(chainId, token, tx))),
            maxBlock: Math.max(maxBlock, chainTxs.length ? max(map(chainTxs, 'blockNumber')) : 0),
          }
        }),
      Promise.resolve({ txs: [], maxBlock: 0 }),
    )

    log.info('Processed Tatum txs', result)

    if (!lastBlock) {
      // replacing the whole tx feed with the new one if no last block was stored
      await Promise.all([EVENT_TYPE_RECEIVENATIVE, EVENT_TYPE_SENDNATIVE].map(type => Feed.find({ type }).delete()))
    }

    const { txs, maxBlock } = result

    if (txs.length) {
      // storing txs in the feed by the chunks
      await chunk(txs, TX_CHUNK).reduce((promise, txs) => promise.then(() => Feed.save(...txs)), Promise.resolve())
      log.info('Stored new Tatum tx items in the feed', { txs })
    }

    if (maxBlock) {
      await storage.setItem(LAST_BLOCK_ITEM, maxBlock)
      log.info('Last Tatum block updated', { lastBlock: maxBlock })
    }

    log.info('Tatum sync done')
  }
}
