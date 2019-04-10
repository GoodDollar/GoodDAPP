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

export type DashboardProps = {
  screenProps: any,
  navigation: any,
  store: Store,
  params: {
    receiveLink: string,
    reason?: string
  }
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
    this.dismissEventDialog()

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

  async withdraw(hash: string, reason?: string) {
    try {
      const { amount, sender } = await goodWallet.canWithdraw(hash)
      const receipt = await goodWallet.withdraw(hash)

      const date = new Date()

      const transactionEvent: TransactionEvent = {
        id: receipt.transactionHash,
        date: date.toString(),
        type: 'withdraw',
        data: {
          sender,
          amount,
          hash,
          receipt
        }
      }

      await UserStorage.updateFeedEvent(transactionEvent)
      const events = await UserStorage.feed.get(date.toISOString().slice(0, 10)).decrypt()

      log.info(events)

      const event = _(events)
        .filter({ id: receipt.transactionHash })
        .value()[0]

      this.setState({
        dialogData: { visible: false },
        eventDialogData: {
          visible: true,
          event,
          reason
        }
      })
    } catch (e) {
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

  dismissDialog = () => {
    this.setState({ dialogData: { visible: false } })
    this.props.screenProps.goToRoot()
  }

  dismissEventDialog = () => {
    this.setState({ eventDialogData: this.defaultEventDialogData })
  }

  render() {
    const { dialogData, eventDialogData } = this.state

    console.log({ eventDialogData })

    return (
      <>
        <CustomDialog {...dialogData} />
        {eventDialogData.visible ? <EventDialog onDismiss={this.dismissEventDialog} {...eventDialogData} /> : null}
      </>
    )
  }
}

export default Withdraw
