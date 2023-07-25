// @flow

import { chunk, clone, map, max, pick, values } from 'lodash'
import moment from 'moment'
import api from '../../API/api'
import { NETWORK_ID } from '../../constants/network'
import { FeedSource } from '../feed'
import type { TransactionEvent } from '../../userStorage/UserStorageClass'
import { FeedItemType, TxStatus } from '../../userStorage/FeedStorage'
import { getNativeToken } from '../../wallet/utils'

const SYNC_CHAINS = values(pick(NETWORK_ID, 'FUSE', 'CELO', 'MAINNET', 'GOERLI'))
const LAST_BLOCKS_ITEM = 'GD_lastNativeTxsBlocks'
const TX_CHUNK = 20

const { COMPLETED } = TxStatus
const { EVENT_TYPE_SENDNATIVE, EVENT_TYPE_RECEIVENATIVE } = FeedItemType

export default class NativeTxsSource extends FeedSource {
  async syncFromRemote() {
    const { db, Feed, log, storage } = this
    const address = db.wallet.account

    const lastBlocks = await storage.getItem(LAST_BLOCKS_ITEM).then(blocks => blocks || {})

    log.info('Native transactions sync started', { lastBlock: lastBlocks, address })

    const txs = []
    const maxBlocks = clone(lastBlocks)

    for (const chainId of SYNC_CHAINS) {
      const token = getNativeToken(chainId)
      const lastBlock = maxBlocks[chainId]

      // eslint-disable-next-line no-await-in-loop
      const chainTxs = await this.queryTxs(chainId, lastBlock)

      log.info('Got native transactions', { chainTxs, chainId })

      if (chainTxs.length) {
        const formattedTxs = chainTxs.map(tx => this.formatTx(chainId, token, tx))

        maxBlocks[chainId] = max(map(chainTxs, 'blockNumber').map(Number))
        txs.push(...formattedTxs)
      }
    }

    log.info('Processed native transactions', { txs, maxBlocks })

    for (const chainId of SYNC_CHAINS) {
      if (lastBlocks[chainId]) {
        continue
      }

      // replacing the whole tx feed with the new one if no last blocks were stored
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        [EVENT_TYPE_RECEIVENATIVE, EVENT_TYPE_SENDNATIVE].map(type => Feed.find({ type, chainId }).delete()),
      )
    }

    if (txs.length) {
      // storing txs in the feed by the chunks
      const txChunks = chunk(txs, TX_CHUNK)

      for (const txs of txChunks) {
        // eslint-disable-next-line no-await-in-loop
        await Feed.save(...txs)
      }

      log.info('Stored new native transactions in the feed', { txs })
    }

    await storage.setItem(LAST_BLOCKS_ITEM, maxBlocks)
    log.info('Last native transactions block updated', { lastBlocks: maxBlocks })

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
