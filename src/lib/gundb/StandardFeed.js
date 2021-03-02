// @flow
import { assign, filter, get, isNil, memoize } from 'lodash'
import { defer, from } from 'rxjs'
import { Platform } from 'react-native'

import Config from '../../config/config'

import isMobilePhone from '../validators/isMobilePhone'
import isEmail from '../../lib/validators/isEmail'

export const EVENT_TYPE_WITHDRAW = 'withdraw'
export const EVENT_TYPE_BONUS = 'bonus'
export const EVENT_TYPE_CLAIM = 'claim'
export const EVENT_TYPE_SEND = 'send'
export const EVENT_TYPE_RECEIVE = 'receive'
export const EVENT_TYPE_MINT = 'mint' // probably bridge transfer

export const CONTRACT_EVENT_TYPE_PAYMENT_WITHDRAW = 'PaymentWithdraw'
export const CONTRACT_EVENT_TYPE_PAYMENT_CANCEL = 'PaymentCancel'
export const CONTRACT_EVENT_TYPE_TRANSFER = 'Transfer'

export const COMPLETED_BONUS_REASON_TEXT = 'Your recent earned rewards'
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

/**
 * StandardFeed element. It's being used to show the feed on dashboard
 * @type
 */
export type StandardFeedItem = {
  id: string,
  date: number,
  type: string, // 'message' | 'withdraw' | 'send',
  data: {
    endpoint: {
      address: string,
      fullName: string,
      avatar?: string,
    },
    amount: string,
    message: string,
  },
}

const favicon = Platform.select({
  web: () => `${Config.publicUrl}/favicon-96x96.png`,
  default: () => require('../../assets/Feed/favicon-96x96.png'),
})()

export class StandardFeed {
  static _hasTxData(feedItem) {
    return get(feedItem, 'receiptReceived', false) || !isNil(get(feedItem, 'data.receiptData'))
  }

  static _getEventCackeKey(event) {
    return get(event, 'id', event)
  }

  constructor(storage, logger) {
    const { _getEventCackeKey } = StandardFeed
    const { _formatEvent } = this
    const memoizedFormatter = memoize(_formatEvent.bind(this), _getEventCackeKey)
    const { cache } = memoizedFormatter

    assign(this, { storage, logger, eventsCache: cache, _formatEvent: memoizedFormatter })
  }

  /**
   * Return all feed events*
   */
  getFormattedEvents(numResults, reset = false) {
    return defer(() => from(this._fetchEvents(numResults, reset)))
  }

  async _fetchEvents(numResults, reset = false) {
    const { _hasTxData } = StandardFeed
    const { storage, logger, _formatEvent } = this
    const feed = await storage.getFeedPage(numResults, reset)

    logger.debug('getFormattedEvents page result:', {
      numResults,
      reset,
      feedPage: feed,
    })

    const filtered = feed.filter(feedItem => {
      const { data, status, otplStatus } = feedItem || {}

      return !isNil(data) && 'cancelled' !== otplStatus && !['deleted', 'cancelled'].includes(status)
    })

    logger.debug('getFormattedEvents done filtering events')

    const withTxData = await Promise.all(
      // eslint-disable-next-line require-await
      filtered.map(async feedItem => {
        if (_hasTxData(feedItem)) {
          return feedItem
        }

        logger.debug('getFormattedEvents missing feed receipt', { feedItem })
        return this._fetchTxData(feedItem)
      }),
    ).then(filter)

    logger.debug('getFormattedEvents done fetching tx data', { withTxData })

    const preformatted = withTxData.map(_formatEvent)

    logger.debug('getFormattedEvents done preformatting events', { preformatted })
    return preformatted
  }

  async _fetchTxData(feedItem) {
    const { _hasTxData } = StandardFeed
    const { storage, logger } = this
    const { wallet } = storage
    const { id } = feedItem

    if (!(id || '').startsWith('0x')) {
      return
    }

    const prevFeedEvent = await storage.getFeedItemByTransactionHash(id)

    if (prevFeedEvent && !_hasTxData(prevFeedEvent)) {
      logger.warn('getFormatedEventById: receipt data missing for:', {
        id,
        prevFeedEvent,
      })

      const receipt = await wallet.getReceiptWithLogs(id).catch(e => {
        logger.warn('no receipt found for id:', e.message, e, id)
        return undefined
      })

      if (receipt) {
        const updatedEvent = await storage.handleReceiptUpdated(receipt)

        if (updatedEvent) {
          logger.debug('getFormatedEventById updated event with receipt', {
            prevFeedEvent,
            updatedEvent,
          })

          return updatedEvent
        }
      }
    }

    return prevFeedEvent
  }

  /**
   * Returns the feed in a standard format to be loaded in feed list and modal
   *
   * @param {FeedEvent} event - Feed event with data, type, date and id props
   * @returns {StandardFeedItem} StandardFeedItem object,
   *  with props { id, date, type, data: { amount, message, endpoint: { address, fullName, avatar, withdrawStatus }}}
   */
  _formatEvent(event) {
    const { logger, storage } = this
    const { wallet } = storage
    const { data, type, date, id, status, createdDate, animationExecuted, action } = event

    logger.debug('formatEvent: incoming event', id, { event })

    const {
      sender,
      preReasonText,
      reason,
      code: withdrawCode,
      otplStatus,
      customName,
      subtitle,
      readMore,
      smallReadMore,
    } = data

    const { address, initiator, initiatorType, value, displayName, message } = this._extractData(event)
    const isDeposit = initiator.toLowerCase() === wallet.oneTimePaymentsContract.address

    const withdrawStatus = this._extractWithdrawStatus(
      withdrawCode || isDeposit,
      isDeposit ? 'pending' : otplStatus,
      status,
      type,
    )

    const displayType = this._extractDisplayType(type, withdrawStatus, status)

    logger.debug('formatEvent: initiator data', event.id, {
      initiatorType,
      initiator,
      address,
    })

    // if customName exist, use it
    const fullName =
      customName ||
      (initiatorType && initiator) ||
      (type === EVENT_TYPE_CLAIM || address === NULL_ADDRESS ? 'GoodDollar' : displayName)

    let avatar = null

    if (
      withdrawStatus === 'error' ||
      type === EVENT_TYPE_BONUS ||
      type === EVENT_TYPE_CLAIM ||
      address === NULL_ADDRESS
    ) {
      avatar = favicon
    }

    return {
      id,
      date: new Date(date).getTime(),
      type,
      displayType,
      status,
      createdDate,
      animationExecuted,
      action,
      data: {
        endpoint: {
          address: sender,
          fullName,
          avatar,
          withdrawStatus,
        },
        amount: value,
        preMessageText: preReasonText,
        message: reason || message,
        subtitle,
        readMore,
        smallReadMore,
        withdrawCode,
      },
    }
  }

  _extractData({ type, id, data: { receiptData, from = '', to = '', counterPartyDisplayName = '', amount } }) {
    const { logger, storage } = this
    const { wallet } = storage.wallet
    const { isAddress } = wallet.utils

    const data = {
      address: '',
      initiator: '',
      initiatorType: '',
      value: '',
      displayName: '',
      message: '',
    }

    if (type === EVENT_TYPE_SEND) {
      data.address = isAddress(to) ? to : receiptData && receiptData.to
      data.initiator = to
    } else if (type === EVENT_TYPE_CLAIM) {
      data.message = 'Your daily basic income'
    } else {
      data.address = isAddress(from) ? from : receiptData && receiptData.from
      data.initiator = from
    }

    data.initiatorType = isMobilePhone(data.initiator) ? 'mobile' : isEmail(data.initiator) ? 'email' : undefined
    data.value = (receiptData && (receiptData.value || receiptData.amount)) || amount
    data.displayName = counterPartyDisplayName || 'Unknown'

    logger.debug('formatEvent: parsed data', {
      id,
      type,
      to,
      counterPartyDisplayName,
      from,
      receiptData,
      ...data,
    })

    return data
  }

  _extractWithdrawStatus(withdrawCode, otplStatus = 'pending', status, type) {
    if (type === 'withdraw') {
      return ''
    }

    return status === 'error' ? status : withdrawCode ? otplStatus : ''
  }

  _extractDisplayType(type, withdrawStatus, status) {
    let suffix = ''

    if (type === EVENT_TYPE_WITHDRAW) {
      suffix = withdrawStatus
    }

    if (type === EVENT_TYPE_SEND) {
      suffix = withdrawStatus
    }

    if (type === EVENT_TYPE_BONUS) {
      suffix = status
    }

    return `${type}${suffix}`
  }

  /*

  const profileNode =
          withdrawStatus !== 'pending' && (await this._getProfileNodeTrusted(initiatorType, initiator, address)) //dont try to fetch profile node of this is a tx we sent and is pending
        const [avatar, fullName] = await Promise.all([
          this._extractAvatar(type, withdrawStatus, get(profileNode, 'gunProfile'), address).catch(e => {
            logger.warn('formatEvent: failed extractAvatar', e.message, e, {
              type,
              withdrawStatus,
              profileNode,
              address,
            })
            return undefined
          }),
          this._extractFullName(
            customName,
            get(profileNode, 'gunProfile'),
            initiatorType,
            initiator,
            type,
            address,
            displayName,
          ).catch(e => {
            logger.warn('formatEvent: failed extractFullName', e.message, e, {
              customName,
              profileNode,
              initiatorType,
              initiator,
              type,
              address,
              displayName,
            })
          }),
        ])


  async _getProfileNodeTrusted(initiatorType, initiator, address): Gun {
    if (!initiator && (!address || address === NULL_ADDRESS)) {
      return
    }

    const byIndex = initiatorType && initiator && (await this.getUserProfilePublickey(initiator))

    const byAddress = address && (await this.getUserProfilePublickey(address))

    let gunProfile = (byIndex || byAddress) && this.gun.get(byIndex || byAddress).get('profile')

    //need to return object so promise.all doesnt resolve node
    return {
      gunProfile,
    }
  }

  async _getProfileNode(initiatorType, initiator, address): Gun {
    const { logger } = this

    const getProfile = async (indexName, idxKey) => {
      const trustIdx = this.trust[indexName]
      const trustExists =
        trustIdx &&
        (await this.gun
          .get(trustIdx)
          .get(idxKey)
          .then())
      let idxSoul = `users/${indexName}`
      if (trustExists) {
        idxSoul = trustIdx
      }
      logger.debug('extractProfile:', { idxSoul, idxKey, trustExists })

      // Need to verify if user deleted, otherwise gun might stuck here and feed wont be displayed (gun <0.2020)
      let gunProfile = this.gun
        .get(idxSoul)
        .get(idxKey)
        .get('profile')

      //need to return object so promise.all doesnt resolve node
      return {
        gunProfile,
      }

      // logger.warn('_extractProfileToShow invalid profile', { idxSoul, idxKey })
      // return undefined
    }

    if (!initiator && (!address || address === NULL_ADDRESS)) {
      return
    }

    const searchField = initiatorType && `by${initiatorType}`
    const byIndex = searchField && (await getProfile(searchField, initiator))

    const byAddress = address && (await getProfile('bywalletAddress', address))

    return byIndex || byAddress
  }

  //eslint-disable-next-line
  async _extractAvatar(type, withdrawStatus, profileToShow, address) {
    const getAvatarFromGun = async () => {
      const avatar = profileToShow && (await profileToShow.get('smallAvatar').then(null, 500))

      // verify account is not deleted and return value
      // if account deleted - the display of 'avatar' field will be private
      return get(avatar, 'privacy') === 'public' ? avatar.display : undefined
    }

    if (
      withdrawStatus === 'error' ||
      type === EVENT_TYPE_BONUS ||
      type === EVENT_TYPE_CLAIM ||
      address === NULL_ADDRESS
    ) {
      return favicon
    }

    return getAvatarFromGun()
  }

  async _extractFullName(customName, profileToShow, initiatorType, initiator, type, address, displayName) {
    const { logger } = this



    const getFullNameFromGun = async () => {
      const fullName = profileToShow && (await profileToShow.get('fullName').then(null, 500))
      logger.debug('profileFromGun:', { fullName })

      // verify account is not deleted and return value
      // if account deleted - the display of 'fullName' field will be private
      return get(fullName, 'privacy') === 'public' ? fullName.display : undefined
    }

    return (
      customName || // if customName exist, use it
      (await getFullNameFromGun()) || // if there's a profile, extract it's fullName
      (initiatorType && initiator) ||
      (type === EVENT_TYPE_CLAIM || address === NULL_ADDRESS ? 'GoodDollar' : displayName)
    )
  }*/
}
