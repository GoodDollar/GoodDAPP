// @flow
import { debounce, find, get, has, isEqual, isUndefined, orderBy, pick, set } from 'lodash'
import EventEmitter from 'eventemitter3'
import moment from 'moment'
import { t } from '@lingui/macro'

import * as TextileCrypto from '@textile/crypto'
import delUndefValNested from '../utils/delUndefValNested'
import Config from '../../config/config'
import logger from '../../lib/logger/js-logger'
import { FEED_UPDATED, fireEvent } from '../analytics/analytics'
import { type UserStorage } from './UserStorageClass'
import { FeedCategories } from './FeedCategory'
import type { FeedFilter } from './UserStorage'
import { asLogRecord } from './utlis'

const log = logger.child({ from: 'FeedStorage' })

const COMPLETED_BONUS_REASON_TEXT = t`Your recent earned rewards`
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

export const TxType = {
  TX_OTPL_CANCEL: 'TX_OTPL_CANCEL',
  TX_OTPL_WITHDRAW: 'TX_OTPL_WITHDRAW', //someone withdraw our own paymentlink
  TX_OTPL_DEPOSIT: 'TX_OTPL_DEPOSIT',
  TX_SEND_GD: 'TX_SEND_GD',
  TX_RECEIVE_GD: 'TX_RECEIVE_GD',
  TX_CLAIM: 'TX_CLAIM',
  TX_REWARD: 'TX_REWARD',
  TX_MINT: 'TX_MINT',
  TX_ERROR: 'TX_ERROR',
  TX_UKNOWN: 'TX_UNKNOWN',
  TX_BRIDGE_IN: 'TX_BRIDGE_IN',
  TX_BRIDGE_OUT: 'TX_BRIDGE_OUT',
}

export const FeedItemType = {
  EVENT_TYPE_SEND: 'send', //send via link
  EVENT_TYPE_WITHDRAW: 'withdraw', //send via link
  EVENT_TYPE_BONUS: 'bonus',
  EVENT_TYPE_CLAIM: 'claim',
  EVENT_TYPE_SENDDIRECT: 'senddirect', //send to address
  EVENT_TYPE_MINT: 'mint',
  EVENT_TYPE_RECEIVE: 'receive',
  EVENT_TYPE_SENDBRIDGE: 'sendbridge',
}

export const TxTypeToEventType = {
  TX_OTPL_CANCEL: FeedItemType.EVENT_TYPE_SEND,
  TX_OTPL_WITHDRAW: FeedItemType.EVENT_TYPE_WITHDRAW,
  TX_OTPL_DEPOSIT: FeedItemType.EVENT_TYPE_SEND,
  TX_SEND_GD: FeedItemType.EVENT_TYPE_SENDDIRECT,
  TX_RECEIVE_GD: FeedItemType.EVENT_TYPE_RECEIVE,
  TX_CLAIM: FeedItemType.EVENT_TYPE_CLAIM,
  TX_REWARD: FeedItemType.EVENT_TYPE_BONUS,
  TX_MINT: FeedItemType.EVENT_TYPE_RECEIVE,
  TX_BRIDGE_OUT: FeedItemType.EVENT_TYPE_SENDBRIDGE,
  TX_BRIDGE_IN: FeedItemType.EVENT_TYPE_RECEIVE,
}

export const TxStatus = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  CANCELED: 'cancelled',
  DELETED: 'deleted',
  ERROR: 'error',
}

export type TransactionDetails = {
  amount: string,
  category: string,
  reason: string | null,
}

export type FeedEvent = {
  id: string,
  chainId: Number,
  type: string,
  date: string,
  createdDate?: string,
  status?: 'pending' | 'completed' | 'error' | 'cancelled' | 'deleted',
  data: any,
  displayType?: string,
  action?: string,
}

// const TX_RECEIVE_TOKEN = 'TX_RECEIVE_TOKEN'
// const TX_SEND_TOKEN = 'TX_SEND_TOKEN'

export const getEventDirection = (feedEvent, reverse = false) => {
  const { type } = feedEvent
  const sendCases = [
    FeedItemType.EVENT_TYPE_SENDDIRECT,
    FeedItemType.EVENT_TYPE_SEND,
    FeedItemType.EVENT_TYPE_SENDBRIDGE,
  ]
  const receiveCases = [
    FeedItemType.EVENT_TYPE_CLAIM,
    FeedItemType.EVENT_TYPE_RECEIVE,
    FeedItemType.EVENT_TYPE_WITHDRAW,
    FeedItemType.EVENT_TYPE_BONUS,
  ]

  log.debug('getEventDirection:', feedEvent?.data?.receiptEvent, feedEvent?.id, feedEvent?.txType)

  if (receiveCases.includes(type)) {
    return reverse ? 'to' : 'from'
  }

  if (sendCases.includes(type)) {
    return reverse ? 'from' : 'to'
  }
  return ''
}

export class FeedStorage {
  // feedMutex = new Mutex()

  feedEvents = new EventEmitter()

  /**
   * current feed item
   */
  cursor: number = 0

  /**
   * In memory array. keep number of events per day
   * @instance {Gun}
   */
  feedIndex: Array<[Date, number]>

  feedQ: {} = {}

  profilesCache = {}

  isEmitEvents = true

  db: ThreadDB

  userStorage: UserStorage

  constructor(userStorage: UserStorage) {
    const { wallet, db, database } = userStorage

    this.db = db
    this.wallet = wallet
    this.storage = database
    this.userStorage = userStorage
    this.walletAddress = wallet.account.toLowerCase()

    log.debug('initialized', { wallet: this.walletAddress })

    this.ready = new Promise((resolve, reject) => {
      this.setReady = resolve
    })
  }

  async init() {
    const receiptEvents = ['receiptUpdated']

    receiptEvents.forEach(e =>
      this.wallet.subscribeToEvent(e, r => {
        log.debug(`receipt callback for event ${e}:`, r.transactionHash)
        this.handleReceipt(r)
      }),
    )

    // mark as initialized, ie resolve ready promise
    await this.storage.ready
    this.storage.on(data => this.emitUpdate(data))

    this.feedInitialized = true
    this.setReady()
  }

  /***
   * return the event relevant for the tx type
   */
  getTXEvent(txType, receipt) {
    const [_from, _to] = ['from', 'to'].map(addr => ev => get(ev, `data.${addr}`, '').toLowerCase())

    switch (txType) {
      case TxType.TX_OTPL_CANCEL:
        return receipt.logs.find(e => e.name === 'PaymentCancel')
      case TxType.TX_OTPL_WITHDRAW:
        return receipt.logs.find(e => e.name === 'PaymentWithdraw')

      case TxType.TX_OTPL_DEPOSIT:
        return receipt.logs.find(
          e =>
            e.name === 'PaymentDeposit' ||
            (_to(e) === this.wallet.oneTimePaymentsContract._address.toLowerCase() && _from(e) === this.walletAddress),
        )

      case TxType.TX_BRIDGE_OUT:
      case TxType.TX_SEND_GD:
        return orderBy(receipt.logs, 'e.data.value', 'desc').find(
          e =>
            e.address === this.wallet.erc20Contract._address &&
            e.name === 'Transfer' &&
            _from(e) === this.walletAddress,
        )
      case TxType.TX_BRIDGE_IN:
      case TxType.TX_MINT:
      case TxType.TX_RECEIVE_GD:
        return orderBy(receipt.logs, 'e.data.value', 'desc').find(
          e =>
            e.address === this.wallet.erc20Contract._address && e.name === 'Transfer' && _to(e) === this.walletAddress,
        )
      case TxType.TX_CLAIM:
        return orderBy(receipt.logs, 'e.data.value', 'desc').find(
          e => e.name === 'UBIClaimed' || (e.name === 'Transfer' && this.wallet.getUBIAddresses().includes(_from(e))),
        )
      case TxType.TX_REWARD:
        return orderBy(receipt.logs, 'e.data.value', 'desc').find(
          e =>
            e.name === 'Transfer' &&
            this.wallet.getRewardsAddresses().includes(_from(e)) &&
            this.walletAddress.toLowerCase() === _to(e),
        )
      default:
        return {}
    }
  }

  /**
   * return the type of TX we are handling
   * checking order is important
   * @param {*} receipt
   */
  getTxType(receipt) {
    if (receipt.status === false) {
      return TxType.TX_ERROR
    }

    const events = get(receipt, 'logs', [])
    const eventsName = {}
    get(receipt, 'logs', []).forEach(_ => (eventsName[_.name] = true))
    log.debug('getReceiptType events:', receipt.transactionHash, { events })

    if (eventsName.PaymentCancel) {
      return TxType.TX_OTPL_CANCEL
    }

    // not actually listening to this event
    if (eventsName.PaymentWithdraw) {
      const event = find(events, { name: 'PaymentWithdraw' })

      log.debug('getReceiptType PaymentWithdraw event', { event })

      if (event) {
        return TxType.TX_OTPL_WITHDRAW
      }
    }

    if (eventsName.PaymentDeposit) {
      const event = events.find(e => {
        const from = get(e, 'data.from', '')
        const to = get(e, 'data.to', '')

        return (
          e.name === 'PaymentDeposit' &&
          to.toLowerCase() === this.wallet.oneTimePaymentsContract._address.toLowerCase() &&
          from.toLowerCase() === this.walletAddress
        )
      })

      log.debug('getReceiptType PaymentDeposit event', { event })

      if (event) {
        return TxType.TX_OTPL_DEPOSIT
      }
    }

    if (eventsName.UBIClaimed) {
      return TxType.TX_CLAIM
    }

    if (eventsName.Transfer) {
      const gdTransferEvents = events.filter(
        e => this.wallet.erc20Contract._address.toLowerCase() === e.address.toLowerCase() && e.name === 'Transfer',
      )

      // we are not listening to the PaymentDeposit event so check here
      if (
        gdTransferEvents.find(
          e =>
            e.data.to.toLowerCase() === this.wallet.oneTimePaymentsContract._address.toLowerCase() &&
            e.data.from.toLowerCase() === this.walletAddress,
        )
      ) {
        return TxType.TX_OTPL_DEPOSIT
      }
      if (gdTransferEvents.find(e => this.wallet.getUBIAddresses().includes(e.data.from.toLowerCase()))) {
        return TxType.TX_CLAIM
      }
      if (gdTransferEvents.find(e => this.wallet.getRewardsAddresses().includes(e.data.from.toLowerCase()))) {
        return TxType.TX_REWARD
      }
      if (
        gdTransferEvents.find(e => this.wallet.getBridgeAddresses().includes(e.data.from.toLowerCase())) || //transfer to bridge router
        gdTransferEvents.find(e => this.wallet.getBridgeAddresses().includes(e.data.to.toLowerCase())) || // transfer from bridge router
        this.wallet.getBridgeAddresses().includes(receipt.to.toLowerCase()) // tx executed on a bridge router in case router can mint from address 0x0...
      ) {
        if (gdTransferEvents.find(e => e.data.to.toLowerCase() === this.walletAddress)) {
          return TxType.TX_BRIDGE_IN
        }
        if (gdTransferEvents.find(e => e.data.from.toLowerCase() === this.walletAddress)) {
          return TxType.TX_BRIDGE_OUT
        }
      }
      if (gdTransferEvents.find(e => e.data.from.toLowerCase() === NULL_ADDRESS)) {
        return TxType.TX_MINT
      }
      if (gdTransferEvents.find(e => e.data.to.toLowerCase() === this.walletAddress)) {
        return TxType.TX_RECEIVE_GD
      }
      if (gdTransferEvents.find(e => e.data.from.toLowerCase() === this.walletAddress)) {
        return TxType.TX_SEND_GD
      }
    }
    return TxType.TX_UKNOWN
  }

  async handleReceipt(receipt) {
    try {
      // format receipt
      receipt.logs.forEach(e => {
        e.data = {}
        e.events.forEach(d => (e.data[d.name] = d.value))
      })

      const txType = this.getTxType(receipt)

      log.debug('handleReceipt got type:', receipt.transactionHash, { txType, receipt })

      if (txType === undefined) {
        throw new Error('Unknown receipt type')
      }

      return await this.handleReceiptUpdate(txType, receipt)
    } catch (e) {
      log.warn('handleReceipt failed:', e.message, e, { receipt })
    }
  }

  async handleReceiptUpdate(txType, receipt) {
    // receipt received via websockets/polling need mutex to prevent race
    // with enqueuing the initial TX data
    // const release = await this.feedMutex.lock()
    try {
      const receiptDate = await this.wallet.wallet.eth
        .getBlock(receipt.blockNumber)
        .then(_ => new Date(_.timestamp * 1000))
        .catch(_ => new Date())

      let feedEvent
      const txEvent = this.getTXEvent(txType, receipt)
      const isPaymentLinkUpdate = txType === TxType.TX_OTPL_WITHDRAW || txType === TxType.TX_OTPL_CANCEL
      log.debug('handleReceiptUpdate got lock:', receipt.transactionHash, { txEvent, txType })

      if (isPaymentLinkUpdate) {
        const paymentId = get(txEvent, 'data.paymentId')

        feedEvent = await this.getFeedItemByPaymentId(paymentId)

        log.debug('got tx by code', receipt.transactionHash, { txType, paymentId })

        if (!feedEvent) {
          log.warn('handleReceiptUpdate: Original tx for payment link not found', txType, receipt.transactionHash, {
            receipt,
          })

          if (txType === TxType.TX_OTPL_CANCEL) {
            return
          }
        } else {
          log.debug('handleReceiptUpdate: found original tx for payment link', {
            paymentId: get(txEvent, 'data.paymentId'),
            txHash: receipt.transactionHash,
            originalTX: feedEvent.id,
          })
        }
      }

      // get existing or make a new event (calling getFeedItem again because this is after mutex, maybe something changed)
      feedEvent = feedEvent ||
        (await this.getFeedItemByTransactionHash(receipt.transactionHash)) || {
          id: receipt.transactionHash,
          createdDate: receiptDate.toISOString(),
          date: receiptDate.toISOString(),
        }

      // cancel/withdraw are updating existing TX so we don't want to return here
      //   if (txType !== TxType.TX_OTPL_WITHDRAW && txType !== TxType.TX_OTPL_CANCEL) {
      //     if (get(feedEvent, 'data.receiptData', feedEvent && feedEvent.receiptReceived)) {
      //       log.debug('handleReceiptUpdate skipping event with existing receipt data', receipt.transactionHash, {
      //         feedEvent,
      //         receipt,
      //       })
      //       return feedEvent
      //     }
      //   }

      let status = TxStatus.COMPLETED
      let otplStatus = ''
      let type = feedEvent.type || TxTypeToEventType[txType]

      switch (txType) {
        case TxType.TX_UKNOWN:
          status = TxStatus.DELETED //mark unknown txs as canceled so they are not shown
          break
        case TxType.TX_ERROR:
          status = TxStatus.ERROR
          break
        case TxType.TX_OTPL_WITHDRAW:
          otplStatus =
            get(txEvent, 'data.to', 'to') === get(txEvent, 'data.from', 'from') ? TxStatus.CANCELED : TxStatus.COMPLETED

          // if withdraw event is of our sent payment, then we change type to "send"
          if (get(txEvent, 'data.from').toLowerCase() === this.walletAddress.toLowerCase()) {
            type = FeedItemType.EVENT_TYPE_SEND
          }

          break
        case TxType.TX_OTPL_DEPOSIT:
          otplStatus = TxStatus.PENDING
          break
        case TxType.TX_OTPL_CANCEL:
          otplStatus = TxStatus.CANCELED
          status = TxStatus.CANCELED
          break
        default:
          break
      }

      // get initial TX data from queue, if not in queue then it must be a receive TX ie
      // not initiated by user
      // other option is that TX was started on another wallet instance
      const initialEvent = this.dequeueTX(receipt.transactionHash) || { data: {} }

      log.debug('handleReceiptUpdate got enqueued event:', receipt.transactionHash, {
        initialEvent,
        feedEvent,
      })

      // if already processed receipt then skip.
      // we need to update item only in case of payment link withdraw/cancel
      if (!isPaymentLinkUpdate && feedEvent.receiptReceived && feedEvent.date) {
        return feedEvent
      }

      log.debug('handleReceiptUpdate type', { feedEvent, type })

      // merge incoming receipt data into existing event
      const updatedFeedEvent: FeedEvent = {
        // we are adding chainId to receipt in GoodWalletClass (chainId is not part of the eth rpc response receipt)
        // this is to prevent possible race condition between receiving events and switching chains which can result in incorrect wallet.networkId
        chainId: receipt.chainId || this.wallet.networkId,
        ...feedEvent,
        ...initialEvent,
        type,
        txType,
        status,
        otplStatus,
        receiptReceived: true,
        date: receiptDate.toISOString(),
        data: {
          ...feedEvent.data,
          ...initialEvent.data,
          receiptEvent: {
            txHash: receipt.transactionHash,
            name: get(txEvent, 'name'),
            eventSource: get(txEvent, 'address'),
            ...get(txEvent, 'data', {}),
          },
        },
      }

      switch (txType) {
        case TxType.TX_REWARD:
          set(updatedFeedEvent, 'data.reason', COMPLETED_BONUS_REASON_TEXT)
          set(updatedFeedEvent, 'data.counterPartyFullName', 'GoodDollar')
          break
        case TxType.TX_BRIDGE_OUT:
        case TxType.TX_BRIDGE_IN:
          set(updatedFeedEvent, 'data.reason', t`Bridged G$`)
          set(updatedFeedEvent, 'data.counterPartyFullName', t`Bridge`)
          break
        case TxType.TX_MINT:
          set(updatedFeedEvent, 'data.reason', t`Minted G$`)
          set(updatedFeedEvent, 'data.counterPartyFullName', t`Rewards`)
          break
        default:
          break
      }

      log.debug('handleReceiptUpdate saving...', receipt.transactionHash, {
        updatedFeedEvent,
      })

      const [counterPartyData, txData] = await Promise.all([
        this.getCounterParty(updatedFeedEvent),
        this.getFromOutbox(updatedFeedEvent),
      ])

      log.debug('handleReceiptUpdate got counterparty and outbox', receipt.transactionHash, {
        counterPartyData,
        txData,
      })
      updatedFeedEvent.fetchedOutbox = true
      updatedFeedEvent.data = { ...updatedFeedEvent.data, ...txData, ...counterPartyData }

      if (updatedFeedEvent.type && !isEqual(feedEvent, updatedFeedEvent)) {
        await this.updateFeedEvent(updatedFeedEvent)

        // calling it here make sure it will be fired only once when receipt for event is processed
        fireEvent(FEED_UPDATED, {
          eventType: updatedFeedEvent.type,
          value: updatedFeedEvent.data?.receiptEvent?.value,
        })
      }

      log.debug('handleReceiptUpdate done, returning updatedFeedEvent', receipt.transactionHash, { updatedFeedEvent })
      return updatedFeedEvent
    } catch (e) {
      log.error('handleReceiptUpdate failed', e.message, e)
    } finally {
      // release()
    }
    return
  }

  async getCounterParty(feedEvent) {
    const addressField = getEventDirection(feedEvent)

    log.debug('getCounterParty:', feedEvent.data.receiptEvent, feedEvent.id, feedEvent.txType)

    const address = get(feedEvent, `data.receiptEvent.${addressField.toLowerCase()}`)

    if (!addressField || !address) {
      return {}
    }

    let profile = await this._readProfileCache(address)
    let { fullName, smallAvatar, lastUpdated } = profile || {}

    // if not cached OR non-complete profile and ttl spent
    if (!profile || ((!fullName || !smallAvatar) && moment().diff(moment(lastUpdated)) > Config.feedItemTtl)) {
      // fetch (or re-fetch) from RealmDB

      profile = await this.userStorage.getPublicProfile(address)
      ;({ fullName, smallAvatar } = profile)

      log.debug('getCounterParty: refetch profile', asLogRecord(profile))

      // cache, update last sync date
      await this._writeProfileCache({ address, fullName, smallAvatar })
    }

    return {
      counterPartyAddress: address,
      counterPartyFullName: fullName || feedEvent.data.counterPartyFullName,
      counterPartySmallAvatar: smallAvatar,
    }
  }

  async _readProfileCache(address) {
    const { profilesCache } = this
    let profile = profilesCache[address]
    const onFindError = e => {
      log.error('_readProfileCache failed', e.message, e, { address })
      throw e
    }

    if (!profile) {
      profile = await this.db.Profiles.findById(address).catch(onFindError)

      if (profile) {
        const { fullName, smallAvatar } = profile

        profilesCache[address] = { fullName, smallAvatar }
      }
    }

    log.debug('_readProfileCache', asLogRecord(profile))
    return profile
  }

  async _writeProfileCache(profile) {
    const { address, fullName, smallAvatar } = profile

    log.debug('_writeProfileCache', asLogRecord(profile))
    this.profilesCache[address] = { fullName, smallAvatar }
    const options = { _id: address, fullName, smallAvatar, lastUpdated: new Date().toISOString() }

    try {
      await this.db.Profiles.save(options)
    } catch (e) {
      log.error('_writeProfileCache failed', e.message, e, { options })

      throw e
    }
  }

  /**
   * remove and return pending TX
   * @param eventId
   * @returns {Promise<FeedEvent>}
   */
  dequeueTX(eventId: string): FeedEvent {
    try {
      const feedItem = this.feedQ[eventId]

      log.debug('dequeueTX got item', eventId, feedItem)

      if (feedItem) {
        delete this.feedQ[eventId]
        return feedItem
      }
    } catch (e) {
      log.error('dequeueTX failed:', e.message, e)
    }
  }

  /**
   * enqueue a new pending TX done on DAPP, to be later merged with the blockchain tx
   * the DAPP event can contain more details than the blockchain tx event
   * @param {FeedEvent} event
   * @returns {Promise<>}
   */
  async enqueueTX(_event: FeedEvent): Promise<> {
    const event = delUndefValNested(_event)

    await this.ready //wait before accessing feedIds cache

    // a race exists between enqueuing and receipt from websockets/polling
    // const release = await this.feedMutex.lock()
    try {
      const existingEvent = await this.storage.read(event.id)

      if (existingEvent) {
        log.warn('enqueueTx skipping existing event id', event, existingEvent)
        return false
      }

      event.chainId = event.chainId || this.wallet.networkId
      event.status = event.status || 'pending'
      event.createdDate = event.createdDate || new Date().toISOString()
      event.date = event.date || event.createdDate

      this.feedQ[event.id] = event

      // encrypt tx details in outbox so receiver can read details
      if (event.type === FeedItemType.EVENT_TYPE_SENDDIRECT) {
        this.addToOutbox(event)
      }

      await this.updateFeedEvent(event)
      log.debug('enqueueTX ok:', { event })

      return true
    } catch (e) {
      log.error('enqueueTX failed: ', e.message, e, { event })
      return false
    } finally {
      // release()
    }
  }

  /**
   * Add or Update feed event
   *
   * @param {FeedEvent} event - Event to be updated
   * @param {string|*} previouseventDate
   * @returns {Promise} Promise with updated feed
   */
  // eslint-disable-next-line require-await
  async updateFeedEvent(event: FeedEvent): Promise<FeedEvent> {
    log.debug('updateFeedEvent:', event.id, { event })

    const eventAck = this.writeFeedEvent(event).catch(e => {
      log.error('updateFeedEvent failedEncrypt byId:', e.message, e, {
        event,
      })

      return { err: e.message }
    })
    return eventAck
  }

  async writeFeedEvent(event): Promise<FeedEvent> {
    await this.ready //wait before accessing feedIds cache

    await this.storage.write(event)

    // this.emitUpdate({ event })
  }

  /**
   * Find feed by transaction hash in array, and returns feed object
   *
   * @param {string} transactionHash - transaction identifier
   * @returns {object} feed item or null if it doesn't exist
   */
  async getFeedItemByTransactionHash(transactionHash: string): Promise<FeedEvent> {
    await this.ready //wait before accessing feedIds cache
    const onReadError = e => {
      log.error('Storage read failed', e.message, e, { transactionHash })
      throw e
    }

    const feedItem = await this.storage.read(transactionHash).catch(onReadError)
    if (feedItem) {
      return feedItem
    }

    log.warn('getFeedItemByTransactionHash: feed item not found', { id: transactionHash })
  }

  /**
   * get transaction id from one time payment link code
   * when a transaction to otpl is made and has the "code" field we index by it.
   * @param {string} hashedCode sha3 of the code
   * @returns transaction id that generated the code
   */
  async getFeedItemByPaymentId(hashedCode: string): Promise<string> {
    try {
      return await this.storage.readByPaymentId(hashedCode)
    } catch (e) {
      log.error('getFeedItemByPaymentId failed', e.message, e, { hashedCode })

      throw e
    }
  }

  /**
   * Sets the event's status
   * @param {string} eventId
   * @param {string} status
   * @returns {Promise<FeedEvent>}
   */
  async updateEventStatus(eventId: string, status: string): Promise<FeedEvent> {
    const feedEvent = await this.getFeedItemByTransactionHash(eventId)

    feedEvent.status = status

    return this.writeFeedEvent(feedEvent)
      .then(_ => feedEvent)
      .catch(e => {
        log.error('updateEventStatus failedEncrypt byId:', e.message, e, {
          feedEvent,
        })

        return {}
      })
  }

  /**
   * Sets the event's status
   * @param {string} eventId
   * @param {string} status
   * @returns {Promise<FeedEvent>}
   */
  async updateOTPLEventStatus(eventId: string, status: string): Promise<FeedEvent> {
    const feedEvent = await this.getFeedItemByTransactionHash(eventId)

    feedEvent.otplStatus = status

    return this.writeFeedEvent(feedEvent)
      .then(_ => feedEvent)
      .catch(e => {
        log.error('updateOTPLEventStatus failedEncrypt byId:', e.message, e, { feedEvent })

        return {}
      })
  }

  /**
   * Sets the event's status as error
   * @param {string} txHash
   * @returns {Promise<void>}
   */
  async markWithErrorEvent(txHash: string): Promise<void> {
    if (txHash === undefined) {
      return
    }

    // const release = await this.feedMutex.lock()

    try {
      await this.updateEventStatus(txHash, 'error')
    } catch (e) {
      log.error('Failed to set error status for feed event', e.message, e)
    } finally {
      // release()
    }
  }

  async getFeedPage(numResult: number, reset?: boolean, category: FeedFilter = FeedCategories.All) {
    if (reset || isUndefined(this.cursor)) {
      this.cursor = 0
    }

    await this.ready

    const items = await this.storage.getFeedPage(numResult, this.cursor, category, this.wallet.networkId)

    this.cursor += items.length

    log.debug('getFeedPage result:', { length: items.length, items })

    const events = await Promise.all(
      items.map(async item => {
        const { id } = item
        log.debug('getFeedPage got item', { id: item.id, item })

        if (!item.receiptReceived && id.startsWith('0x') && item.type !== 'news') {
          const receipt = await this.wallet.getReceiptWithLogs(id).catch(e => {
            log.warn('getFeedPage no receipt found for id:', e.message, e, { id })
          })

          if (receipt) {
            log.warn('getFeedPage: missing item in cache, processing receipt again', { id, receipt })
            item = await this.handleReceipt(receipt)
          } else {
            log.warn('getFeedPage no receipt found for undefined item id:', id)
          }
        }

        // returning item, it may be undefined
        return item
      }),
    )

    return events.filter(_ => _)
  }

  /**
   * in case of sending G$ directly, we keep tx details in an outbox so recipient can fetch it async
   * this is also used with the payment api that can add fields such as senderEmail,senderName,invoiceId
   * @param {*} event
   */
  async addToOutbox(event: FeedEvent) {
    let recipientPubkey = await this.userStorage.getUserProfilePublickey(event.data.to) //remove ~prefix

    if (recipientPubkey) {
      const pubKey = TextileCrypto.PublicKey.fromString(recipientPubkey)

      const data = pick(event.data, [
        'reason',
        'category',
        'amount',
        'senderEmail',
        'senderName',
        'invoiceId',
        'sellerWebsite',
        'sellerName',
      ])

      const encoded = new TextEncoder().encode(JSON.stringify(data))
      const encrypted = await pubKey.encrypt(encoded).then(_ => Buffer.from(_).toString('base64'))

      log.debug('addToOutbox data', { data, txHash: event.id, recipientPubkey, encrypted })

      await this.storage.addToOutbox(recipientPubkey, event.id, encrypted)
    } else {
      log.warn('addToOutbox recipient not found:', event.id)
    }
  }

  /**
   * in case of sending G$ directly, we keep tx details in an outbox so recipient can fetch it async
   * this is also used with the payment api that can add fields such as senderEmail,senderName,invoiceId
   * @param {*} event
   */
  async getFromOutbox(event: FeedEvent) {
    // if outbox data missing from event
    if (
      event.txType !== TxType.TX_RECEIVE_GD ||
      has(event, 'fetchedOutbox') ||
      has(event, 'data.category') ||
      has(event, 'data.reason')
    ) {
      return {}
    }

    const recipientPublicKey = this.userStorage.profilePrivateKey.public.toString()
    const txData = await this.storage.getFromOutbox(recipientPublicKey, event.id)

    try {
      log.debug('getFromOutbox saved data', txData)
      return txData || {}
    } catch (e) {
      log.error('getFromOutbox failed', e.message, e, { event, recipientPublicKey })

      throw e
    }
  }

  emitUpdate = debounce(
    event => {
      if (this.isEmitEvents) {
        this.feedEvents.emit('updated', event)
        log.debug('emitted updated event', { event })
      }
    },
    1000,
    { leading: true },
  )

  getAllFeed() {
    return this.db.Feed.find().toArray()
  }

  hasFeedItem(id) {
    return this.db.Feed.has(id)
  }
}
