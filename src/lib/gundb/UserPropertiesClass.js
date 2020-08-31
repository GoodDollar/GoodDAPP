// @flow
import { assign, isUndefined } from 'lodash'
import { defer, from as fromPromise } from 'rxjs'
import { retry } from 'rxjs/operators'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { REGISTRATION_METHOD_SELF_CUSTODY } from '../constants/login'
import pino from '../logger/pino-logger'

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
    cameFromW3Site: false,
    lastBonusCheckDate: null,
    countClaim: 0,
    regMethod: REGISTRATION_METHOD_SELF_CUSTODY,
    showQuickActionHint: true,
    registered: false,
    startClaimingAdded: false,
    lastBlock: 0,
  }

  fields = [
    'isMadeBackup',
    'firstVisitApp',
    'etoroAddCardSpending',
    'isAddedToHomeScreen',
    'cameFromW3Site',
    'lastBonusCheckDate',
    'countClaim',
    'regMethod',
    'showQuickActionHint',
    'startClaimingAdded',
  ]

  /**
   * a gun node referring tto gun.user().get('properties')
   * @instance {UserProperties}
   */
  propsNode: Gun

  data: {}

  constructor(gun: Gun) {
    // creating getter for propsNode dynamically to avoid this.gun incapsulation
    Object.defineProperty(this, 'propsNode', {
      get: () => gun.user().get('properties'),
    })

    const fetchProps = async () => {
      let props
      const { propsNode } = this
      const { defaultProperties } = UserProperties
      try {
        //sync from storage
        props = await defer(() => fromPromise(propsNode.then(_ => propsNode.decrypt()))) // init user storage
          .pipe(retry(1)) // if exception thrown, retry init one more times
          .toPromise()
      } catch (exception) {
        const { message } = exception

        log.error('failed decrypting props', message, exception)
        props = {}
      }

      if (isUndefined(props)) {
        log.warn('undefined props from decrypt')
      }

      this.data = assign({}, defaultProperties, props)
    }

    this.ready = (async () => {
      const props = await AsyncStorage.getItem('props')

      //if not props then block
      if (props == null) {
        await fetchProps()
      } else {
        //otherwise sync withs torage in background
        this.data = assign({}, this.defaultProperties, props)
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
    const { data, propsNode } = this

    assign(data, properties)

    try {
      propsNode.secretAck(data)
      await AsyncStorage.setItem('props', data)
    } catch (e) {
      log.error('set() / updateAll() user props failed:', e.message, e, { properties })
      throw e
    }

    return true
  }

  /**
   * Reset properties to the default state
   */
  async reset() {
    const { propsNode } = this
    const { defaultProperties } = UserProperties

    this.data = assign({}, defaultProperties)

    try {
      propsNode.secretAck(defaultProperties)
      await AsyncStorage.setItem('props', defaultProperties)
    } catch (e) {
      log.error('reset() user props failed:', e.message, e)
      throw e
    }

    return true
  }
}
