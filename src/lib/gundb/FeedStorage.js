// @flow
import {
  camelCase,
  filter,
  find,
  flatten,
  get,
  isEqual,
  isError,
  isUndefined,
  merge,
  noop,
  omit,
  orderBy,
  some,
  takeWhile,
  toPairs,
  uniqBy,
} from 'lodash'
import Mutex from 'await-mutex'
import EventEmitter from 'eventemitter3'

import delUndefValNested from '../utils/delUndefValNested'
import AsyncStorage from '../utils/asyncStorage'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'FeedStorage' })

/**TODO:
 * handle bonuses
 * handle bridge(mint)
 * refactor feeditem types
 * refactor feeditem status
 * refactor receiptData to receiptEvent
 * refactor senddirect + receivedirect
 * clean UserStorage
 */

function isValidDate(d) {
  return d instanceof Date && !isNaN(d)
}

const COMPLETED_BONUS_REASON_TEXT = 'Your recent earned rewards'
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

export const TxType = {
  TX_OTPL_CANCEL: 'TX_OTPL_CANCEL',
  TX_OTPL_WITHDRAW: 'TX_OTPL_WITHDRAW',
  TX_OTPL_DEPOSIT: 'TX_OTPL_DEPOSIT',
  TX_SEND_GD: 'TX_SEND_GD',
  TX_RECEIVE_GD: 'TX_RECEIVE_GD',
  TX_CLAIM: 'TX_CLAIM',
  TX_REWARD: 'TX_REWARD',
  TX_MINT: 'TX_MINT',
}

export const TxTypeToEventType = {
  TX_OTPL_CANCEL: 'send',
  TX_OTPL_WITHDRAW: 'send',
  TX_OTPL_DEPOSIT: 'send',
  TX_SEND_GD: 'senddirect',
  TX_RECEIVE_GD: 'receivedirect',
  TX_CLAIM: 'claim',
  TX_REWARD: 'bonus',
  TX_MINT: 'receive',
}

export const FeedItemType = {
  EVENT_TYPE_SEND: 'send', //send via link
  EVENT_TYPE_BONUS: 'bonus',
  EVENT_TYPE_CLAIM: 'claim',
  EVENT_TYPE_SENDDIRECT: 'senddirect', //send to address
  EVENT_TYPE_MINT: 'mint',
  EVENT_TYPE_RECEIVE: 'receive',
}

export const TxStatus = {
  SEND_COMPLETED: 'SEND_COMPLETED',
  PENDING: 'PENDING',
  CANCELED: 'CANCELLED',
  WITHDRAWN: 'WITHDRAWN',
}

export type FeedEvent = {
  id: string,
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

export class FeedStorage {
  feedMutex = new Mutex()

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

  feedIds: {} = {}

  feedQ: {} = {}

  constructor(gun, wallet, userStorage) {
    this.gun = gun
    this.wallet = wallet
    this.userStorage = userStorage
    ;['receiptReceived', 'receiptUpdated', 'otplUpdated'].forEach(e =>
      wallet.subscribeToEvent(e, r => this.handleReceipt(r)),
    )
    this.walletAddress = wallet.account.toLowerCase()
    log.debug('initialized', { wallet: this.walletAddress })
  }

  async init() {
    this.feedInitialized = true
    const { feed } = await this.gunuser

    log.debug('initfeed', { feed })

    if (feed == null) {
      // for some reason this breaks on gun 2020 https://github.com/amark/gun/issues/987
      await this.feed
        .putAck({ initialized: true }) // restore old feed data - after nullified
        .catch(e => {
          log.error('initfeed restore old feed data failed:', e.message, e)
          throw e
        })

      log.debug('initfeed empty feed', { feed })
    }

    const feedIndex = await this.feed.get('index').then()
    this.feed.get('index').on(this.updateFeedIndex, false)
    log.debug('initFeed subscribed to feedIndex', { feedIndex })

    // load unencrypted feed from cache
    this.feedIds = await AsyncStorage.getItem('GD_feed')
      .catch(() => {
        log.warn('initfeed failed parsing feed from cache')
      })
      .then(ids => ids || {})

    //no need to block on this
    this._syncFeedCache()
  }

  async _syncFeedCache() {
    const items = await this.feed
      .get('byid')
      .then(null, 2000)
      .catch(e => {
        log.warn('initfeed fetch byid onthen failed', { e })
      })

    log.debug('initfeed cache byid', { items })

    if (!items) {
      await this.feed.putAck({ byid: {} }).catch(e => {
        log.error('init feed cache byid failed:', e.message, e)
        throw e
      })

      return
    }

    const ids = Object.entries(omit(items, '_'))

    log.debug('initfeed cache got items', { ids })

    const promises = ids.map(async ([k, v]) => {
      if (this.feedIds[k]) {
        return false
      }

      const data = await this.feed
        .get('byid')
        .get(k)
        .decrypt()
        .catch(noop)
      log.debug('initfeed cache got missing cache item', { id: k, data })

      if (!data) {
        return false
      }

      this.feedIds[k] = data
      return true
    })

    Promise.all(promises)
      .then(shouldUpdateStatuses => {
        if (!some(shouldUpdateStatuses)) {
          return
        }

        log.debug('initfeed updating cache', this.feedIds, shouldUpdateStatuses)
        AsyncStorage.setItem('GD_feed', this.feedIds)
        this.feedEvents.emit('updated', {})
      })
      .catch(e => log.error('initfeed error caching feed items', e.message, e))
  }

  get gunuser() {
    return this.gun.user()
  }

  get feed() {
    return this.gun.user().get('feed')
  }

  /***
   * retun the event relevant for the tx type
   */
  getTXEvent(txType, receipt) {
    switch (txType) {
      case TxType.TX_OTPL_CANCEL:
        return receipt.logs.find(e => e.name === 'PaymentCancel')
      case TxType.TX_OTPL_WITHDRAW:
        return receipt.logs.find(e => e.name === 'PaymentWithdraw')

      case TxType.TX_OTPL_DEPOSIT:
        return receipt.logs.find(
          e =>
            e.name === 'PaymentDeposit' ||
            (e.data.to.toLowerCase() === this.wallet.oneTimePaymentsContract.address.toLowerCase() &&
              e.data.from.toLowerCase() === this.walletAddress),
        )
      case TxType.TX_SEND_GD:
        return orderBy(receipt.logs, 'e.data.value', 'desc').find(
          e => e.name === 'Transfer' && e.data.from.toLowerCase() === this.walletAddress,
        )
      case TxType.TX_MINT:
      case TxType.TX_RECEIVE_GD:
        return orderBy(receipt.logs, 'e.data.value', 'desc').find(
          e => e.name === 'Transfer' && e.data.to.toLowerCase() === this.walletAddress,
        )
      case TxType.TX_CLAIM:
        return orderBy(receipt.logs, 'e.data.value', 'desc').find(
          e =>
            e.name === 'UBIClaimed' ||
            (e.name === 'Transfer' && this.wallet.getUBIAddresses().includes(e.data.from.toLowerCase())),
        )
      case TxType.TX_REWARD:
        return orderBy(receipt.logs, 'e.data.value', 'desc').find(
          e => e.name === 'Transfer' && this.wallet.getRewardsAddresses().includes(e.data.from.toLowerCase()),
        )
      default:
        return
    }
  }

  /**
   * return the type of TX we are handling
   * checking order is important
   * @param {*} receipt
   */
  getTxType(receipt) {
    const events = get(receipt, 'logs', [])
    const eventsName = get(receipt, 'logs', []).map(_ => _.name)
    log.debug('getReceiptType events:', receipt.transactionHash, { events })

    if (eventsName.includes('PaymentCancel')) {
      return TxType.TX_OTPL_CANCEL
    }

    //not actually listerning to this event
    if (eventsName.includes('PaymentWithdraw')) {
      return TxType.TX_OTPL_WITHDRAW
    }
    if (eventsName.includes('PaymentDeposit')) {
      return TxType.TX_OTPL_DEPOSIT
    }
    if (eventsName.includes('UBIClaimed')) {
      return TxType.TX_CLAIM
    }
    if (eventsName.includes('Transfer')) {
      const gdTransferEvents = events.filter(
        e => this.wallet.erc20Contract.address.toLowerCase() === e.address.toLowerCase() && e.name === 'Transfer',
      )

      //we are not listening to the PaymentDeposit event so check here
      if (
        gdTransferEvents.find(
          e =>
            e.data.to.toLowerCase() === this.wallet.oneTimePaymentsContract.address.toLowerCase() &&
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
  }

  async handleReceipt(receipt) {
    try {
      //format receipt
      receipt.logs.forEach(e => {
        e.data = {}
        e.events.forEach(d => (e.data[d.name] = d.value))
      })

      const txType = this.getTxType(receipt)
      log.debug('handleReceipt got type:', receipt.transactionHash, { txType, receipt })
      if (txType === undefined) {
        throw new Error('Unknown receipt type')
      }

      await this.handleReceiptUpdate(txType, receipt)
    } catch (e) {
      log.warn('handleReceipt failed:', { receipt }, e.message, e)
    }
  }

  async handleReceiptUpdate(txType, receipt) {
    //receipt received via websockets/polling need mutex to prevent race
    //with enqueuing the initial TX data
    const release = await this.feedMutex.lock()
    try {
      const receiptDate = await this.wallet.wallet.eth
        .getBlock(receipt.blockNumber)
        .then(_ => new Date(_.timestamp * 1000))
        .catch(_ => new Date())

      const txEvent = this.getTXEvent(txType, receipt)
      log.debug('handleReceiptUpdate got lock:', receipt.transactionHash, { txEvent, txType })

      let eventTxHash = receipt.transactionHash
      if (txType === TxType.TX_OTPL_WITHDRAW || txType === TxType.TX_OTPL_CANCEL) {
        log.debug('getting tx hash by code', receipt.transactionHash, { txType })
        eventTxHash = await this.getTransactionHashByCode(txEvent.data.paymentId)
        log.debug('got tx hash by code', receipt.transactionHash, { txType, eventTxHash })

        if (!eventTxHash) {
          log.warn('handleReceiptUpdate: Original tx for payment link not found', txType, receipt.transactionHash, {
            receipt,
          })
          eventTxHash = receipt.transactionHash
          if (txType === TxType.TX_OTPL_CANCEL) {
            return
          }
        } else {
          log.debug('handleReceiptUpdate: found original tx for payment link', {
            paymentId: txEvent.data.paymentId,
            eventTxHash,
          })
        }
      }

      //get existing or make a new event (calling getFeedItem again because this is after mutex, maybe something changed)
      const feedEvent = (await this.getFeedItemByTransactionHash(eventTxHash)) || {
        id: eventTxHash,
        createdDate: receiptDate.toString(),
      }

      //cancel/withdraw are updating existing TX so we dont want to return here
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
      switch (txType) {
        case TxType.TX_OTPL_DEPOSIT:
          //update index for payment links by paymentId, so we can update when we receive withdraw event
          this.feed.get('codeToTxHash').put({ [txEvent.data.paymentId]: feedEvent.id })
          status = TxStatus.PENDING
          break
        case TxType.TX_OTPL_CANCEL:
          //update index for payment links by paymentId, so we can update when we receive withdraw event
          status = TxStatus.CANCELED
          break
        default:
          break
      }

      //get initial TX data from queue, if not in queue then it must be a receive TX ie
      //not initiated by user
      //other option is that TX was started on another wallet instance
      const initialEvent = this.dequeueTX(receipt.transactionHash) || {
        data: {},
      }

      log.debug('handleReceiptUpdate got enqueued event:', receipt.transactionHash, {
        initialEvent,
        feedEvent,
      })

      //merge incoming receipt data into existing event
      const updatedFeedEvent: FeedEvent = {
        ...feedEvent,
        ...initialEvent,
        type: TxTypeToEventType[txType],
        txType,
        status,
        receiptReceived: true,
        date: receiptDate.toString(),
        data: {
          ...feedEvent.data,
          ...initialEvent.data,
          receiptEvent: { name: txEvent.name, eventSource: txEvent.address, ...txEvent.data },
        },
      }

      switch (txType) {
        case TxType.TX_REWARD:
          feedEvent.data.reason = COMPLETED_BONUS_REASON_TEXT
          feedEvent.data.customName = 'GoodDollar'
          break
        case TxType.TX_MINT:
          feedEvent.data.reason = 'Your Transfered G$s'
          feedEvent.data.customName = 'Fuse Bridge'
          break
        default:
          break
      }

      log.debug('handleReceiptUpdate saving...', receipt.transactionHash, {
        updatedFeedEvent,
      })

      if (isEqual(feedEvent, updatedFeedEvent) === false) {
        await this.updateFeedEvent(updatedFeedEvent, feedEvent.date)
      }
      log.debug('handleReceiptUpdate saving... done', receipt.transactionHash)
      this.updateFeedEventCounterParty(updatedFeedEvent, receipt)

      return updatedFeedEvent
    } catch (e) {
      log.error('handleReceiptUpdate failed', e.message, e)
    } finally {
      release()
    }
    return
  }

  updateFeedEventCounterParty(feedEvent, receipt) {
    const getCounterParty = async address => {
      const publicKey = await this.userStorage.getUserProfilePublickey(address)
      log.debug('updateFeedEventCounterParty got counter party:', feedEvent.id, { publicKey, address })

      if (!publicKey) {
        return
      }
      feedEvent.data.counterPartyAddress = address
      feedEvent.data.counterPartyProfile = publicKey

      await this.updateFeedEvent(feedEvent)
      ;['fullName', 'smallAvatar'].forEach(field => {
        this.gun
          .get(publicKey)
          .get('profile')
          .get(field)
          .get('display')
          .on((value, nodeID, message, event) => {
            event.off()
            if (!value) {
              return
            }
            log.debug('updateFeedEventCounterParty updating field:', feedEvent.id, {
              field,
              value,
              data: feedEvent.data,
            })
            feedEvent.data[camelCase(`counterParty ${field}`)] = value

            this.updateFeedEvent(feedEvent)
          })
      })
    }

    //TODO: get user+avatar or contract name
    log.debug('updateFeedEventCounterParty:', feedEvent.data.receiptEvent, feedEvent.id, feedEvent.txType)

    switch (feedEvent.txType) {
      case TxType.TX_OTPL_WITHDRAW:
      case TxType.TX_SEND_GD:
        getCounterParty(feedEvent.data.receiptEvent.to, feedEvent)
        break
      case TxType.TX_RECEIVE_GD:
        getCounterParty(feedEvent.data.receiptEvent.from, feedEvent)
        break
      default:
        break
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

    //a race exists between enqueuing and receipt from websockets/polling
    const release = await this.feedMutex.lock()
    try {
      const existingEvent = this.feedIds[event.id]

      if (existingEvent) {
        log.warn('enqueueTx skipping existing event id', event, existingEvent)
        return false
      }

      event.status = event.status || 'pending'
      event.createdDate = event.createdDate || new Date().toString()
      event.date = event.date || event.createdDate

      this.feedQ[event.id] = event

      const paymentId = get(event, 'data.hashedCode')
      if (paymentId) {
        this.feed
          .get('codeToTxHash')
          .get(paymentId)
          .put(event.id)
      }

      await this.updateFeedEvent(event)
      log.debug('enqueueTX ok:', { event, paymentId })

      return true
    } catch (gunError) {
      const e = this._gunException(gunError)

      log.error('enqueueTX failed: ', e.message, e, { event })
      return false
    } finally {
      release()
    }
  }

  /**
   * Add or Update feed event
   *
   * @param {FeedEvent} event - Event to be updated
   * @param {string|*} previouseventDate
   * @returns {Promise} Promise with updated feed
   */
  async updateFeedEvent(event: FeedEvent, previouseventDate: string | void): Promise<FeedEvent> {
    log.debug('updateFeedEvent:', event.id, { event })

    //saving index by onetime code so we can retrieve and update it once withdrawn
    //or skip own withdraw
    const { feed } = this

    let { date } = event

    date = new Date(date)

    // force valid dates
    date = isValidDate(date) ? date : new Date()
    let day = `${date.toISOString().slice(0, 10)}`

    //check if we need to update the day index location
    if (previouseventDate) {
      let prevdate = new Date(previouseventDate)
      prevdate = isValidDate(prevdate) ? prevdate : date
      let prevday = `${prevdate.toISOString().slice(0, 10)}`
      if (day !== prevday) {
        let dayEventsArr =
          (await feed.get(prevday).then(data => (typeof data === 'string' ? JSON.parse(data) : data), 5000)) || []
        let removePos = dayEventsArr.findIndex(e => e.id === event.id)
        if (removePos >= 0) {
          dayEventsArr.splice(removePos, 1)
          feed.get(prevday).put(JSON.stringify(dayEventsArr))
          feed
            .get('index')
            .get(prevday)
            .put(dayEventsArr.length)
        }
      }
    }

    // Update dates index
    let dayEventsArr =
      (await feed.get(day).then(data => (typeof data === 'string' ? JSON.parse(data) : data), 5000)) || []
    let toUpd = find(dayEventsArr, e => e.id === event.id)
    const eventIndexItem = { id: event.id, updateDate: event.date }
    if (toUpd) {
      merge(toUpd, eventIndexItem)
    } else {
      let insertPos = dayEventsArr.findIndex(e => date > new Date(e.updateDate))
      if (insertPos >= 0) {
        dayEventsArr.splice(insertPos, 0, eventIndexItem)
      } else {
        dayEventsArr.unshift(eventIndexItem)
      }
    }

    log.debug('updateFeedEvent starting encrypt', event.id, { dayEventsArr, toUpd, day })

    // Saving eventFeed by id
    const eventAck = this.writeFeedEvent(event).catch(e => {
      log.error('updateFeedEvent failedEncrypt byId:', e.message, e, {
        event,
      })

      return { err: e.message }
    })
    log.debug('updateFeedEvent encrypted saved', event.id)
    const saveDayIndexPtr = feed.get(day).putAck(JSON.stringify(dayEventsArr))

    const saveDaySizePtr = feed
      .get('index')
      .get(day)
      .putAck(dayEventsArr.length)

    const saveAck =
      saveDayIndexPtr && saveDayIndexPtr.then().catch(e => log.error('updateFeedEvent dayIndex', e.message, e))

    const ack = saveDaySizePtr && saveDaySizePtr.then().catch(e => log.error('updateFeedEvent daySize', e.message, e))

    log.debug('updateFeedEvent done returning promise', event.id)
    return Promise.all([saveAck, ack, eventAck])
      .then(() => event)
      .catch(gunError => {
        const e = this._gunException(gunError)

        log.error('Save Indexes failed', e.message, e)
      })
  }

  writeFeedEvent(event): Promise<FeedEvent> {
    this.feedIds[event.id] = event
    AsyncStorage.setItem('GD_feed', this.feedIds)
    this.feedEvents.emit('updated', { event })
    return this.feed
      .get('byid')
      .get(event.id)
      .secretAck(event)
      .catch(e => {
        log.error('writeFeedEvent failed:', e.message, e, { event })
        throw e
      })
  }

  /**
   * Used as subscription callback for gundb
   * When the index of <day> to <number of events> changes
   * We get the object and turn it into a sorted array by <day> which we keep in memory for feed display purposes
   * @param {object} changed the index data from gundb an object with days as keys and number of event in that day as value
   * @param {string} field the name of the gundb key changed
   */
  updateFeedIndex = (changed: any, field: string) => {
    if (field !== 'index' || changed === undefined) {
      return
    }
    delete changed._
    let dayToNumEvents: Array<[string, number]> = toPairs(changed)
    this.feedIndex = orderBy(dayToNumEvents, day => day[0], 'desc')
    this.feedEvents.emit('updated')
    log.debug('updateFeedIndex', {
      changed,
      field,
      newIndex: this.feedIndex,
    })
  }

  /**
   * Find feed by transaction hash in array, and returns feed object
   *
   * @param {string} transactionHash - transaction identifier
   * @returns {object} feed item or null if it doesn't exist
   */
  getFeedItemByTransactionHash(transactionHash: string): Promise<FeedEvent> {
    const feedItem = this.feedIds[transactionHash]
    if (feedItem) {
      return feedItem
    }

    return this.feed
      .get('byid')
      .get(transactionHash)
      .decrypt()
      .then(feedItem => {
        // update feed cache here
        this.feedIds[transactionHash] = feedItem
        return feedItem
      })
      .catch(noop)
  }

  /**
   * get transaction id from one time payment link code
   * when a transaction to otpl is made and has the "code" field we index by it.
   * @param {string} hashedCode sha3 of the code
   * @returns transaction id that generated the code
   */
  getTransactionHashByCode(hashedCode: string): Promise<string> {
    return this.feed
      .get('codeToTxHash')
      .get(hashedCode)
      .then()
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
   * Sets the feed animation status
   * @param {string} eventId
   * @param {boolean} status
   * @returns {Promise<FeedEvent>}
   */
  async updateFeedAnimationStatus(eventId: string, status = true): Promise<FeedEvent> {
    const feedEvent = await this.getFeedItemByTransactionHash(eventId)

    feedEvent.animationExecuted = status

    return this.writeFeedEvent(feedEvent)
      .then(_ => feedEvent)
      .catch(e => {
        log.error('updateFeedAnimationStatus by ID failed:', e.message, e, {
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

    const release = await this.feedMutex.lock()

    try {
      await this.updateEventStatus(txHash, 'error')
    } catch (e) {
      log.error('Failed to set error status for feed event', e.message, e)
    } finally {
      release()
    }
  }

  /**
   * Returns the next page in feed. could contain more than numResults. each page will contain all of the transactions
   * of the last day fetched even if > numResults
   *
   * @param {number} numResults - return at least this number of results if available
   * @param {boolean} reset - should restart cursor
   * @returns {Promise} Promise with an array of feed events
   */
  async getFeedPage(numResults: number, reset?: boolean = false): Promise<Array<FeedEvent>> {
    let { feedIndex, feedIds } = this

    if (!feedIndex) {
      log.warn('feedIndex not set returning empty')
      return []
    }

    if (reset || isUndefined(this.cursor)) {
      this.cursor = 0
    }

    // running through the days history until we got the request numResults
    // storing days selected to the daysToTake
    let total = 0
    let daysToTake = takeWhile(feedIndex.slice(this.cursor), ([, eventsAmount]) => {
      const takeDay = total < numResults

      if (takeDay) {
        total += eventsAmount
      }

      return takeDay
    })

    this.cursor += daysToTake.length

    // going through the days we've selected, fetching feed indexes for that days
    let promises: Array<Promise<Array<FeedEvent>>> = daysToTake.map(([date]) =>
      this.feed
        .get(date)
        .then(data => (typeof data === 'string' ? JSON.parse(data) : data))
        .catch(e => {
          log.error('getFeed', e.message, e)
          return []
        }),
    )

    // filtering indexed items, taking the items a) having non-empty id b) having unique id
    const eventsIndex = await Promise.all(promises).then(indexes => {
      const filtered = filter(flatten(indexes), 'id')

      return uniqBy(filtered, 'id')
    })

    log.debug('getFeedPage', {
      feedIndex,
      daysToTake,
      eventsIndex,
    })

    const events = await Promise.all(
      eventsIndex.map(async ({ id }) => {
        // taking feed item from the cache
        let item = feedIds[id]
        log.debug('getFeedPage got item', { id, item })

        // if no item in the cache and it's some transaction
        // then getting tx item details from the wallet
        if (!item && id.startsWith('0x')) {
          const receipt = await this.wallet.getReceiptWithLogs(id).catch(e => {
            log.warn('getFeedPagee no receipt found for id:', id, e.message, e)
          })

          if (receipt) {
            item = await this.handleReceiptUpdated(receipt)
          } else {
            log.warn('getFeedPage no receipt found for undefined item id:', id)
          }
        }

        // returning item, it may be undefined
        return item
      }),
    )

    // filtering events fetched to exclude empty/null/undefined ones
    const filteredEvents = filter(
      events,
      e => e && !['deleted', 'cancelled', 'canceled'].includes(get(e, 'status', '').toLowerCase()),
    )
    log.debug('getFeedPage filteredEvents', { filteredEvents })

    if (eventsIndex.length > 0 && filteredEvents.length < numResults) {
      log.debug('getFeedPage fetching more results')
      const more = await this.getFeedPage(numResults - filteredEvents.length)
      return filteredEvents.concat(more)
    }
    return filteredEvents
  }

  _gunException(gunError) {
    let exception = gunError

    if (!isError(exception)) {
      exception = new Error(gunError.err || gunError)
    }

    return exception
  }
}
