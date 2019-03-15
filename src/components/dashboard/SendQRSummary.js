// @flow
import React, { useState } from 'react'
import { View } from 'react-native'

import logger from '../../lib/logger/pino-logger'
import { useWrappedGoodWallet } from '../../lib/wallet/useWrappedWallet'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { Avatar, BigGoodDollar, CustomButton, CustomDialog, Section, Wrapper } from '../common'
import TopBar from '../common/TopBar'
import { receiveStyles } from './styles'
import GDStore from '../../lib/undux/GDStore'
export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send GD'

const log = logger.child({ from: 'SendQRSummary' })

const SendQRSummary = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState] = useScreenState(screenProps)
  const goodWallet = useWrappedGoodWallet()
  const store = GDStore.useStore()
  const { loading } = store.get('currentScreen')

  const { amount, reason, to } = screenState
  const sendGD = async () => {
    try {
      const receipt = await goodWallet.sendAmount(to, amount)
      log.debug({ receipt })
      store.set('currentScreen')({
        dialogData: {
          visible: true,
          title: 'SUCCESS!',
          message: 'The GD was sent successfully',
          dismissText: 'Yay!',
          onDismiss: screenProps.goToParent
        }
      })
    } catch (e) {
      log.error(e)
    }
  }

  return (
    <Wrapper style={styles.wrapper}>
      <TopBar />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <Section.Title style={styles.headline}>Summary</Section.Title>
          <View style={styles.sectionTo}>
            <Avatar size={90} />
            {to && <Section.Text style={styles.toText}>{`To: ${to}`}</Section.Text>}
          </View>
          <Section.Text>
            {`Here's `}
            <BigGoodDollar number={amount} />
          </Section.Text>
          <Section.Text>{reason ? reason : null}</Section.Text>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <CustomButton mode="contained" onPress={sendGD} style={{ flex: 2 }} loading={loading}>
              Confirm
            </CustomButton>
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

const styles = {
  ...receiveStyles,
  headline: {
    textTransform: 'uppercase'
  },
  sectionTo: {
    alignItems: 'center'
  },
  toText: {
    marginTop: '1rem',
    marginBottom: '1rem'
  }
}

SendQRSummary.navigationOptions = {
  title: TITLE
}

export default SendQRSummary
