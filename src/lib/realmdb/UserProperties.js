// @flow
import { assign, isNil } from 'lodash'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { retry } from '../../lib/utils/async'
import { REGISTRATION_METHOD_SELF_CUSTODY } from '../constants/login'
import pino from '../logger/pino-logger'
import getFeedDB from './FeedDB'
const log = pino.child({ from: 'UserProperties' })

/**
 * Users gundb to handle user storage.
 * User storage is used to keep the user Self Soverign Profile and his blockchain transcation history
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
    isAddedToHomeScreen: false,
    lastBonusCheckDate: null,
    countClaim: 0,
    regMethod: REGISTRATION_METHOD_SELF_CUSTODY,
    showQuickActionHint: true,
    registered: false,
    startClaimingAdded: false,
    lastBlock: 6400000,
    joinedAtBlock: 6400000, // default block to start sync from
    lastTxSyncDate: 0,
    hasOpenedGoodMarket: false,
    hasOpenedInviteScreen: false,
    goodMarketClicked: false,
    inviterInviteCode: null,
    inviteCode: null,
    lastInviteState: { pending: 0, approved: 0 },
  }

  fields = [
    'isMadeBackup',
    'firstVisitApp',
    'etoroAddCardSpending',
    'isAddedToHomeScreen',
    'lastBonusCheckDate',
    'countClaim',
    'regMethod',
    'showQuickActionHint',
    'startClaimingAdded',
    'joinedAtBlock',
    'lastTxSyncDate',
    'hasOpenedGoodMarket',
    'goodMarketClicked',
    'lastInviteState',
  ]

  data: {}

  constructor() {
    const { defaultProperties } = UserProperties
    this.storage = getFeedDB()
    const syncProps = props => (this.data = assign({}, defaultProperties, props || {}))

    const fetchProps = async () => {
      await this.storage.ready
      const props = await this.storage.decryptSettings()

      syncProps(props)
    }

    this.ready = (async () => {
      const props = await AsyncStorage.getItem('props')

      log.debug('found local settings:', { props })

      // if not props then block
      if (isNil(props)) {
        await fetchProps()
      } else {
        // otherwise sync withs storage in background
        syncProps(props)
        fetchProps()
      }

      return this.data
    })()
  }

  /**
   * Set value to property
   *
   * @param {string} field
   * @param {string} value
   * @returns {Promise<void>}
   */
  async set(field: string, value: any) {
    await this.updateAll({ [field]: value })

    return true
  }

  /**
   * Return property values
   * @param field
   * @returns {Promise<any>}
   */
  get(field: string) {
    return this.data[field]
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

    return true
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
   * Helper method for store props both in the GUN and AsyncStorage
   * @private
   */
  async _storeProps(data, logLabel, logPayload = {}) {
    const logError = e => log.error(`${logLabel} user props failed:`, e.message, e, logPayload)

    try {
      await AsyncStorage.setItem('props', data)
      this.storage.ready.then(_ => retry(() => this.storage.encryptSettings(data), 2, 500).catch(logError)) //dont await on this, sync in background
    } catch (e) {
      logError(e)
      throw e
    }
  }
}
