// @flow
import React, { useCallback, useState } from 'react'
import { Text, View } from 'react-native'
import { TextInput } from 'react-native-paper'
import goodWallet from '../../lib/wallet/GoodWallet'

import { Section, Wrapper, Avatar, BigNumber, CustomButton, CustomDialog } from '../common'
import { BackButton, PushButton, useScreenState } from '../appNavigation/stackNavigation'
import { receiveStyles } from './styles'
import TopBar from '../common/TopBar'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send GD'

const SendLinkSummary = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState] = useScreenState(screenProps)
  const [dialogData, setDialogData] = useState()
  const [loading, setLoading] = useState()

  const dismissDialog = () => {
    setDialogData({ visible: false })
  }

  const { amount, reason, to } = screenState

  const generateLink = async () => {
    setLoading(true)
    try {
      const url = await goodWallet.generateLink(amount)
      screenProps.push('SendConfirmation', { url })
    } catch (e) {
      setDialogData({ visible: true, title: 'Error', message: e.message })
      setLoading(false)
    }
  }
  return (
    <Wrapper style={styles.wrapper}>
      <TopBar />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <Section.Title style={styles.headline}>Summery</Section.Title>
          <View style={styles.sectionTo}>
            <Avatar size={90} />
            {to && <Section.Text style={styles.toText}>{`To: ${to}`}</Section.Text>}
          </View>
          <Section.Text>
            {`Here's `}
            <BigNumber number={amount} unit="GD" />
          </Section.Text>
          <Section.Text>{reason && `For ${reason}`}</Section.Text>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <CustomButton mode="contained" onPress={generateLink} style={{ flex: 2 }} loading={loading}>
              Next
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

SendLinkSummary.navigationOptions = {
  title: TITLE
}

export default SendLinkSummary
