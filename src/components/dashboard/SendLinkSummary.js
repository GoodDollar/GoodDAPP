// @flow
import React, { useCallback, useState } from 'react'
import { Text, View } from 'react-native'
import { TextInput } from 'react-native-paper'
import goodWallet from '../../lib/wallet/GoodWallet'

import { Section, Wrapper, Avatar, BigNumber, CustomButton } from '../common'
import { BackButton } from '../appNavigation/stackNavigation'
import { receiveStyles } from './styles'
import TopBar from '../common/TopBar'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send GD'

const SendLinkSummary = (props: AmountProps) => {
  const { screenProps, navigation } = props
  const amount = navigation.getParam('amount')
  const reason = navigation.getParam('reason')
  const to = navigation.getParam('to')

  const [loading, setLoading] = useState()
  const generateLink = async () => {
    setLoading(true)
    const url = await goodWallet.generateLink(amount)
    screenProps.push('SendConfirmation', { url })
  }

  return (
    <Wrapper style={styles.wrapper}>
      <TopBar />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <Section.Title style={styles.headline}>Summery</Section.Title>
          <Section.Row>
            <Avatar size={90} />
          </Section.Row>
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
    </Wrapper>
  )
}

const styles = {
  ...receiveStyles,
  headline: {
    textTransform: 'uppercase'
  }
}

SendLinkSummary.navigationOptions = {
  title: TITLE
}

export default SendLinkSummary
