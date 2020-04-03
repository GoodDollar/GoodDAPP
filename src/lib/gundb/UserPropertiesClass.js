//@flow

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
    isAddedLongUseOfClaimsFeed: false,
  }

  fields = [
    'isMadeBackup',
    'firstVisitApp',
    'etoroAddCardSpending',
    'isAddedToHomeScreen',
    'cameFromW3Site',
    'lastBonusCheckDate',
    'countClaim',
  ]

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
   * Set value to property
   *
   * @param {string} field
   * @param {string} value
   * @returns {Promise<void>}
   */
  async set(field: string, value: any) {
    await this.gun.get(field).putAck(value)

    return true
  }

  /**
   * Return properties from GUN
   * @returns {*}
   */
  getPropertiesFromGun() {
    return this.gun
  }

  /**
   * Return property values
   * @param field
   * @returns {Promise<any>}
   */
  get(field: string) {
    return this.gun.get(field)
  }

  /**
   * Return all Properties
   * @returns {{}}
   */
  getAll() {
    return this.getPropertiesFromGun()
  }
}
