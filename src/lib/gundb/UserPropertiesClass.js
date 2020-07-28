// @flow

import { REGISTRATION_METHOD_SELF_CUSTODY } from '../constants/login'

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

  constructor(propertiesGun: Gun) {
    this.gun = propertiesGun
    this.ready = this.gun
      .decrypt()
      .catch(_ => {})
      .then(_ => Object.assign({}, UserProperties.defaultProperties, _))
      .then(_ => (this.data = _))
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
  async updateAll(data: { [string]: any }): Promise<boolean> {
    Object.assign(this.data, data)
    await this.gun.secret(this.data)

    return true
  }
}
