// @flow
import { assign } from 'lodash'
import { defer, from as fromPromise } from 'rxjs'
import { retry } from 'rxjs/operators'

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
  gun: Gun

  data: {}

  constructor(gun: Gun) {
    this.gun = gun

    this.ready = (async () => {
      let props
      const { defaultProperties } = UserProperties

      //make sure we fetch props first and not having gun return undefined
      await this.props

      try {
        props = await defer(() => fromPromise(this.props.decrypt())) // init user storage
          .pipe(retry(1)) // if exception thrown, retry init one more times
          .toPromise()
      } catch (e) {
        log.error('failed decrypting props', e.message, e)
        props = {}
      }
      props === undefined && log.warn('undefined props from decrypt')
      this.data = assign({}, defaultProperties, props)
      return this.data
    })()
  }

  get props() {
    return this.gun.user().get('properties')
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
    await this.props.secret(data)

    return true
  }

  /**
   * Reset properties to the default state
   */
  async reset() {
    const { defaultProperties } = UserProperties

    this.data = assign({}, defaultProperties)
    await this.props.secret(defaultProperties)

    return true
  }
}
