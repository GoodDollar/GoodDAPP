// @flow
import * as React from 'react'
import logger from '../../lib/logger/pino-logger'
import goodWallet from '../../lib/wallet/GoodWallet'
import Splash from '../splash/Splash'

type AccountProviderProps = {
  children: React.Node
}

export type AccountProviderState = {
  balance: ?string,
  entitlement: ?string,
  ready: boolean,
  transferEventsHandlers: [any, any]
}

const mockEventHandler = { unsubscribe: () => true }
const log = logger.child({ from: 'AccountProvider' })

const AccountContext: React.Context<any> = React.createContext()

class AccountProvider extends React.Component<AccountProviderProps, AccountProviderState> {
  state = {
    balance: undefined,
    entitlement: undefined,
    ready: false,
    transferEventsHandlers: [mockEventHandler, mockEventHandler]
  }

  async componentDidMount(): Promise<void> {
    log.info('mounting')
    await goodWallet.ready
    await this.updateValues()
    this.setAsReady()
    this.initTransferEvents()
    log.info('done mounting')
  }

  componentWillUnmount(): void {
    log.info('unmounting!')
    this.unsubscribeTransferEvents()
  }

  setAsReady() {
    this.setState({ ready: true })
  }

  updateValues() {
    return Promise.all([this.updateBalance(), this.updateEntitlement()])
  }

  /**
   * Retrieves account's balance and sets its value to the state
   * @returns {Promise<void>}
   */
  async updateBalance(): Promise<void> {
    try {
      log.info('updating balance')

      const balance = await goodWallet.balanceOf()

      log.info({ balance })

      this.setState({ balance })
    } catch (error) {
      log.error('failed to gather balance value:', { error })
    }
  }

  /**
   * Retrieves account's entitlement and sets its value to the state
   * @returns {Promise<void>}
   */
  async updateEntitlement(): Promise<void> {
    try {
      log.info('updating entitlement')

      const entitlement = await goodWallet.checkEntitlement()

      log.info({ entitlement })

      this.setState({ entitlement })
    } catch (error) {
      log.error('failed to gather entitlement value:', { error })
    }
  }

  /**
   * Starts listening to Transfer events to (and from) the current account
   * and stores event handlers in the store to be able to unsubscribe from them
   */
  initTransferEvents(): void {
    log.info('checking events')

    const transferEventsHandlers: [any, any] = goodWallet.balanceChanged(this.onBalanceChange)

    log.info('the events handlers', { transferEventsHandlers })

    this.setState({ transferEventsHandlers })
  }

  /**
   * Callback to handle events emmited
   * @param error
   * @param event
   * @returns {Promise<void>}
   */
  onBalanceChange = async (error: {}, event: {}) => {
    log.info('new Transfer event:', { error, event })

    if (error) {
      // // If there's any error it will unsubscribe and reconnect
      // this.unsubscribeTransferEvents()
      // // a new web3 instance is required: https://github.com/ethereum/web3.js/issues/1354#issuecomment-365938093
      // await goodWallet.init()
      // this.initTransferEvents()
    } else {
      await this.updateValues()
    }
  }

  /**
   * Unsubscribe from Transfer Events
   */
  unsubscribeTransferEvents() {
    log.info('unsubscribing')
    this.state.transferEventsHandlers.forEach(handler => handler.unsubscribe())
  }

  render() {
    if (this.state.ready) {
      const { balance, entitlement } = this.state

      return <AccountContext.Provider value={{ balance, entitlement }}>{this.props.children}</AccountContext.Provider>
    }

    return <Splash />
  }
}

const AccountConsumer = AccountContext.Consumer

export { AccountProvider, AccountConsumer, AccountContext }
