// @flow
import _ from 'lodash'
import React, { Component } from 'react'
import type { Store } from 'undux'

import type { TransactionEvent } from '../../lib/gundb/UserStorage'
import UserStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import goodWallet from '../../lib/wallet/GoodWallet'
import { CustomDialog } from '../common'
import EventDialog from '../common/EventDialog'
import type { EventDialogProps } from '../common/EventDialog'
import { getInitialFeed } from '../../lib/undux/utils/feed'

export type DashboardProps = {
  navigation: any,
  store: Store,
  params: {
    receiveLink: string,
    reason?: string
  },
  onSuccess?: Function,
  onFail?: Function
}

type DashboardState = {
  dialogData: {
    visible: boolean,
    title?: string,
    message?: string
  },
  eventDialogData: EventDialogProps,
  currentIndex: number
}

const log = logger.child({ from: 'Withdraw' })

class Withdraw extends Component<DashboardProps, DashboardState> {
  defaultEventDialogData = { visible: false, event: { data: {}, id: '', date: '', type: '' } }

  state = {
    dialogData: { visible: false },
    eventDialogData: this.defaultEventDialogData,
    currentIndex: 0
  }

  componentDidMount() {
    const { receiveLink, reason } = this.props.params

    log.info({ receiveLink, reason })

    if (receiveLink) {
      this.setState({
        dialogData: {
          visible: true,
          title: 'Processing withrawal...',
          loading: true,
          dismissText: 'hold'
        }
      })
      this.withdraw(receiveLink, reason)
    }
  }

  /**
   * Check if user can withdraw, and make the transaciton
   *
   * @param {string} hash - Hash identifier
   * @param {string} reason - Withdraw reason
   */
  async withdraw(hash: string, reason?: string) {
    try {
      const { amount, sender } = await goodWallet.canWithdraw(hash)
      const receipt = await goodWallet.withdraw(hash, {
        onTransactionHash: transactionHash => {
          logger.debug({ hash })
          const date = new Date()

          const transactionEvent: TransactionEvent = {
            id: transactionHash,
            date: date.toString(),
            type: 'withdraw',
            data: {
              amount,
              hash,
              sender
            }
          }

          UserStorage.updateFeedEvent(transactionEvent)
        }
      })
      const event = await UserStorage.getFeedItemByTransactionHash(receipt.transactionHash)
      log.info({ event, receipt })

      const profile = await UserStorage.getUserProfile(sender)

      this.setState(
        {
          dialogData: { visible: false },
          eventDialogData: {
            visible: true,
            event: {
              ...event,
              data: {
                ...profile,
                ...event.data,
                sender
              }
            },
            reason
          }
        },
        () => getInitialFeed(this.props.store)
      )
    } catch (e) {
      log.error({ e })
      this.setState({
        dialogData: {
          visible: true,
          title: 'Error',
          message: e.message,
          onDismiss: this.dismissDialog
        }
      })
    }
  }

  /**
   * Cancel withdraw and close dialog
   */
  dismissDialog = () => {
    this.setState({ dialogData: { visible: false } })
    this.props.onFail && this.props.onFail()
  }

  /**
   * Reset dialog data
   */
  dismissEventDialog = () => {
    this.setState({ eventDialogData: this.defaultEventDialogData })
    this.props.onSuccess && this.props.onSuccess()
  }

  render() {
    const { dialogData, eventDialogData } = this.state

    return (
      <>
        <CustomDialog {...dialogData} />
        {eventDialogData.visible ? <EventDialog onDismiss={this.dismissEventDialog} {...eventDialogData} /> : null}
      </>
    )
  }
}

export default Withdraw
