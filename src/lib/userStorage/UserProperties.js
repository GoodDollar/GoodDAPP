// @flow
import { assign, clone, forIn, isNil, isPlainObject, isString, noop, throttle } from 'lodash'
import EventEmitter from 'eventemitter3'
import shallowEqual from 'fbjs/lib/shallowEqual'

import AsyncStorage from '../utils/asyncStorage'
import { retry } from '../utils/async'

import { REGISTRATION_METHOD_SELF_CUSTODY } from '../constants/login'
import pino from '../logger/js-logger'

const log = pino.child({ from: 'UserProperties' })

/**
 * Keep user local and persisted flags/properties
 * @class
 *  */
export default class UserProperties {
  /**
   * Default User Properties
   * @type {{isMadeBackup: boolean, firstVisitApp:number, etoroAddCardSpending:boolean, isAddedToHomeScren: false}}
   */
  static defaultProperties = {
    isMadeBackup: false,
    firstVisitApp: null,
    etoroAddCardSpending: true,
    lastBonusCheckDate: null,
    countClaim: 0,
    regMethod: REGISTRATION_METHOD_SELF_CUSTODY,
    showQuickActionHint: true,
    registered: false,
    startClaimingAdded: false,
    lastTxSyncDate: 0,
    hasOpenedGoodMarket: false,
    hasOpenedInviteScreen: false,
    goodMarketClicked: false,
    inviteBonusCollected: false,
    inviterInviteCode: null,
    inviteCode: null,
    lastInviteState: { pending: 0, approved: 0 },
  }

  data = {}

  local = {}

  lastStored = {}

  events = new EventEmitter()

  constructor(storage) {
    const { defaultProperties } = UserProperties
    this.storage = storage
    this.data = assign({}, defaultProperties)

    this.ready = (async () => {
      const props = await AsyncStorage.getItem('props')
      const localProps = await AsyncStorage.getItem('localProps')

      this.local = assign({}, localProps)
      this.throttlePersist = throttle(() => this.persist(), 60000, { leading: true })

      log.debug('found local settings:', { props, localProps, local: this.local })

      // if not props then block
      if (isNil(props)) {
        await this._syncFromRemote()
      } else {
        // otherwise sync withs storage in background
        this._syncProps(props)
        this._syncFromRemote()
      }

      return this.data
    })()
  }

  _syncProps(props) {
    const data = assign({}, UserProperties.defaultProperties, props || {})

    assign(this, { data, lastStored: clone(data) })
  }

  async _syncFromRemote() {
    await this.storage.ready

    try {
      const props = await this.storage.decryptSettings()

      log.debug('got remote props:', { props })
      this._syncProps(props)
    } catch (e) {
      log.error('error getting remote props', e.message, e)
    }
  }

  /**
   * Set value to property
   *
   * @param {string} field
   * @param {string} value
   * @returns {Promise<void>}
   */
  async set(field: string, value: any) {
    const props = this._makeProps(field, value)

    await this.updateAll(props)
    return true
  }

  safeSet(field: string, value: any = null) {
    const props = this._makeProps(field, value)

    // any error will be logged in updateAll / storeProps
    this.updateAll(props).catch(noop)
  }

  setLocal(field: string, value: any = null) {
    const { local } = this

    assign(local, this._makeProps(field, value))
    AsyncStorage.safeSet('localProps', local)

    return true
  }

  getLocal(field: string) {
    return this.local[field]
  }

  /**
   * Return property values
   * @param field
   * @returns {any}
   */
  get(field: string) {
    const { data } = this

    return field in data ? data[field] : this.local[field]
  }

  /**
   * Return all Properties
   * @returns {{}}
   */
  getAll() {
    return this.data
  }

  /**
   * Set value to multiple properties
   */
  async updateAll(properties: { [string]: any }): Promise<boolean> {
    const { data } = this

    assign(data, properties)
    await this._storeProps(data, 'set() / updateAll()', { properties })
    forIn(properties, (value, field) => this.events.emit(field, value))

    return true
  }

  on(field, callback) {
    this.events.on(field, callback)
  }

  off(field, callback = null) {
    const { events } = this

    if (callback) {
      events.off(field, callback)
      return
    }

    events.removeAllListeners(field)
  }

  /**
   * Reset properties to the default state
   */
  async reset() {
    const { defaultProperties } = UserProperties

    this.data = assign({}, defaultProperties)
    await this._storeProps(defaultProperties, 'reset()')

    return true
  }

  /**
   * Helper method for store props both in storage and AsyncStorage
   * @private
   */
  async _storeProps(data, logLabel, logPayload = {}) {
    const logError = e => log.error(`${logLabel} user props failed:`, e.message, e, logPayload)

    try {
      await AsyncStorage.setItem('props', data)

      // dont await on this, sync in background
      this.ready.then(() => this.throttlePersist().catch(logError))
    } catch (e) {
      logError(e)
      throw e
    }
  }

  // eslint-disable-next-line require-await
  async persist() {
    const { data, lastStored, storage } = this
    const propsUpdated = shallowEqual(data, lastStored)

    log.debug('persist called:', { data, lastStored, propsUpdated })

    // no need deep check as lastStored is just a shallow copy
    if (propsUpdated) {
      log.debug('persist: props unchanged, skipping')
      return
    }

    await retry(() => storage.encryptSettings(data), 2, 500)
    this.lastStored = clone(data)
    log.debug('persist: stored new props')
  }

  _makeProps(field: string | object, value = null) {
    let props = {}

    if (isString(field)) {
      props = { [field]: value }
    } else if (isPlainObject(field)) {
      props = field
    }

    return props
  }
}
