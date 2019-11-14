//@flow
import Gun from '@gooddollar/gun-appendonly'
import _ from 'lodash'
import pino from '../logger/pino-logger'

const logger = pino.child({ from: 'UserStorage' })

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
  }

  fields = ['isMadeBackup', 'firstVisitApp', 'etoroAddCardSpending', 'isAddedToHomeScreen', 'cameFromW3Site']

  /**
   * a gun node referring tto gun.user().get('properties')
   * @instance {UserProperties}
   */
  gun: Gun

  data: {}

  constructor(propertiesGun: Gun) {
    this.gun = propertiesGun
  }

  /**
   * Load user properties from gun to this.data
   * @returns {Promise<void>}
   */
  async updateLocalData() {
    const tempData = await this.getPropertiesFromGun()

    this.data = _.pick(tempData, this.fields)
    logger.debug('set data properties ok:', { data: this.data })
  }

  /**
   * Set value to property
   *
   * @param {string} field
   * @param {string} value
   * @returns {Promise<void>}
   */
  async set(field: string, value: any) {
    await this.gun
      .get('properties')
      .get(field)
      .putAck(value)
    await this.updateLocalData()

    return true
  }

  /**
   * Return properties from GUN
   * @returns {*}
   */
  getPropertiesFromGun() {
    return this.gun.get('properties')
  }

  /**
   * Return property values
   * @param field
   * @returns {Promise<undefined>}
   */
  async get(field: string) {
    if (!this.data.hasOwnProperty(field)) {
      await this.updateLocalData()
    }

    return this.data.hasOwnProperty(field) ? this.data[field] : undefined
  }

  /**
   * Return all Properties
   * @returns {{}}
   */
  getAll() {
    return this.data
  }
}
