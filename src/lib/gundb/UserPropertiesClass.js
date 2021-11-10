// @flow
import { assign, isNil, isUndefined } from 'lodash'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { retry } from '../../lib/utils/async'
import { REGISTRATION_METHOD_SELF_CUSTODY } from '../constants/login'
import pino from '../logger/js-logger'

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
    lastBlock: 6400000, // default block to start sync from
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
    'lastBlock',
    'lastTxSyncDate',
    'hasOpenedGoodMarket',
    'goodMarketClicked',
    'lastInviteState',
  ]

  /**
   * a gun node referring tto gun.user().get('properties')
   * @instance {UserProperties}
   */
  propsNode: Gun

  data: {}

  constructor(gun: Gun) {
    const { defaultProperties } = UserProperties

    // creating getter for propsNode dynamically to avoid this.gun incapsulation
    Object.defineProperty(this, 'propsNode', {
      get: () => gun.user().get('properties'),
    })

    const syncProps = props => (this.data = assign({}, defaultProperties, props || {}))

    const fetchProps = async () => {
      let props
      const { propsNode } = this

      try {
        //sync from storage
        props = await retry(() => propsNode.then(() => propsNode.decrypt(), 1000), 3, 1000) // init user storage
      } catch (exception) {
        const { message } = exception

        log.error('failed decrypting props', message, exception, { profile: gun.user().is.pub })

        //reset props in case of data corruption - hack for gun issues
        if (message === 'Decrypting key missing') {
          this.reset()
        }

        props = {}
      }

      if (isUndefined(props)) {
        log.warn('undefined props from decrypt')
      }

      syncProps(props)
    }

    this.ready = (async () => {
      const props = await AsyncStorage.getItem('props')

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
    const { propsNode } = this
    const logError = e => log.error(`${logLabel} user props failed:`, e.message, e, logPayload)

    try {
      AsyncStorage.setItem('props', data)
      await retry(() => propsNode.secretAck(data), 2, 500).catch(logError)
    } catch (e) {
      logError(e)
      throw e
    }
  }
}
