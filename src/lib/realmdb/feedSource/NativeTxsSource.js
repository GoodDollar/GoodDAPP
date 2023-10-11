// @flow

import { chunk, clone, flatten, map, max } from 'lodash'
import moment from 'moment'
import api from '../../API/api'
import { NETWORK_ID } from '../../constants/network'
import { FeedSource } from '../feed'
import type { TransactionEvent } from '../../userStorage/UserStorageClass'
import { FeedItemType, TxStatus } from '../../userStorage/FeedStorage'
import { getNativeToken, supportedNetworks } from '../../wallet/utils'

const LAST_BLOCKS_ITEM = 'GD_lastNativeTxsBlocks'
const TX_CHUNK = 20

const { COMPLETED } = TxStatus
const { EVENT_TYPE_SENDNATIVE, EVENT_TYPE_RECEIVENATIVE } = FeedItemType

export default class NativeTxsSource extends FeedSource {
  async syncFromRemote() {
    const { db, Feed, log, storage } = this
    const { wallet } = db
    const { account: address } = wallet

    const lastBlocks = await storage.getItem(LAST_BLOCKS_ITEM).then(blocks => blocks || {})

    log.info('Native transactions sync started', { lastBlock: lastBlocks, address })

    const maxBlocks = clone(lastBlocks)

    // now we do not poll mainnet on dev/qa and goerli on pro
    // and fuse goes through explorer so it's up to 2 x 2 req to Tatum
    // which is less than limit of 5 and coudl be done in parralel
    const txs = await Promise.all(
      supportedNetworks.map(async network => {
        const chainId = NETWORK_ID[network]
        const token = getNativeToken(chainId)
        const lastBlock = maxBlocks[chainId]

        // eslint-disable-next-line no-await-in-loop
        const chainTxs = await this.queryTxs(chainId, lastBlock)

        log.info('Got native transactions', { chainTxs, chainId })

        if (!chainTxs.length) {
          return []
        }

        maxBlocks[chainId] = max(map(chainTxs, 'blockNumber').map(Number))
        return chainTxs.map(tx => this.formatTx(chainId, token, tx))
      }),
    ).then(flatten)

    log.info('Processed native transactions', { txs, maxBlocks })

    if (txs.length) {
      // storing txs in the feed by the chunks
      await Promise.all(chunk(txs, TX_CHUNK).map(txs => Feed.save(...txs)))
      wallet.notifyBalanceChanged()

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

    return api.getNativeTxs(account, chainId, fromBlock, true)
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
