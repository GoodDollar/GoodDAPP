// @flow
import { defaults, once } from 'lodash'
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
   * a gun node referring to gun.user().get('properties')
   * @instance {UserProperties}
   */
  node: Gun

  /** @private */
  props: {}

  get ready(): Promise {
    return this.loadInBackground()
  }

  /** @private */
  loadInBackground = once(async () => {
    let props
    const { constructor, node } = this
    const { defaultProperties } = constructor

    try {
      props = await node.decrypt()
    } catch {
      props = {}
    }

    props = defaults(props, defaultProperties)
    this.props = props

    return props
  })

  constructor(propsNode: Gun) {
    this.node = propsNode
    this.loadInBackground()
  }

  /**
   * Set value to property
   *
   * @param {string} field
   * @param {string} value
   * @returns {Promise<boolean>}
   */
  // eslint-disable-next-line require-await
  async set(field: string, value: any) {
    return this.updateAll({ [field]: value })
  }

  /**
   * Return property values
   * @param field
   * @returns {any}
   */
  get(field: string) {
    const { props } = this

    return props[field]
  }

  /**
   * Return all Properties
   * @returns {{}}
   */
  getAll() {
    const { props } = this

    return { ...props }
  }

  /**
   * Sets all properties from the object passed
   * Warning! This method rewrites all props, if you need
   * just update a few props - use updateProps()
   *
   * @param {object} newProps Object to set properties from
   */
  async setAll(newProps: object): Promise<boolean> {
    const { node } = this
    const props = { ...newProps }

    await node.secret(props)
    this.props = props

    return true
  }

  /**
   * Updates props by merging them with the object passed
   *
   * @param {object} updateProps Object to merge properties with
   */
  // eslint-disable-next-line require-await
  async updateAll(updateProps: object): Promise<boolean> {
    const { props } = this
    const updatedProps = { ...props, ...updateProps }

    return this.setAll(updatedProps)
  }

  /**
   * Resets props to the default ones
   * Warning! This method rewrites all props
   */
  // eslint-disable-next-line require-await
  async reset() {
    const { defaultProperties } = this.constructor

    return this.setAll(defaultProperties)
  }
}
