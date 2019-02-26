// @flow
import React, { useCallback, useState } from 'react'
import { Text, View } from 'react-native'
import { TextInput } from 'react-native-paper'

import { Section, Wrapper, Avatar, BigNumber } from '../common'
import { BackButton, PushButton } from '../appNavigation/stackNavigation'
import { receiveStyles } from './styles'
import TopBar from '../common/TopBar'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send GD'

const SendLinkSummary = (props: AmountProps) => {
  const { screenProps, navigation } = props
  const amount = navigation.getParam('amount', 0)
  const reason = navigation.getParam('reason', '')
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
          <Section.Text>{`For ${reason}`}</Section.Text>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <PushButton
              mode="contained"
              screenProps={{ ...screenProps }}
              params={{ reason, amount }}
              routeName={'SendConfirmation'}
              style={{ flex: 2 }}
            >
              Next
            </PushButton>
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
