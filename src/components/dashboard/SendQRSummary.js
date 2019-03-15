// @flow
import React, { useState } from 'react'
import { View } from 'react-native'

import logger from '../../lib/logger/pino-logger'
import goodWallet from '../../lib/wallet/GoodWallet'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { Avatar, BigGoodDollar, CustomButton, CustomDialog, Section, Wrapper } from '../common'
import TopBar from '../common/TopBar'
import { receiveStyles } from './styles'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send GD'

const log = logger.child({ from: 'SendQRSummary' })

const SendQRSummary = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState] = useScreenState(screenProps)
  const [dialogData, setDialogData] = useState()
  const [loading, setLoading] = useState(false)

  const { amount, reason, to } = screenState

  const dismissDialog = () => {
    setDialogData({ visible: false })
    screenProps.goToParent()
  }

  const sendGD = async () => {
    setLoading(true)

    try {
      const receipt = await goodWallet.sendAmount(to, amount)
      log.debug({ receipt })
      setDialogData({ visible: true, title: 'SUCCESS!', message: 'The GD was sent successfully', dismissText: 'Yay!' })
    } catch (e) {
      setDialogData({ visible: true, title: 'Error', message: e.message })
    }

    setLoading(false)
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
            <CustomButton mode="contained" onPress={sendGD} style={{ flex: 2 }} loading={loading} disabled={loading}>
              Confirm
            </CustomButton>
          </View>
        </Section.Row>
      </Section>
      <CustomDialog onDismiss={dismissDialog} {...dialogData} />
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
