// @flow
import React, { useCallback, useState } from 'react'
import { Text, View } from 'react-native'
import { TextInput } from 'react-native-paper'

import { Section, Wrapper } from '../common'
import { BackButton, PushButton } from '../appNavigation/stackNavigation'
import { receiveStyles as styles } from './styles'
import TopBar from '../common/TopBar'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send GD'

const SendSummery = (props: AmountProps) => {
  const { screenProps, navigation } = props
  const amount = navigation.getParam('amount', 0)

  const [reason, setReason] = useState('')
  return (
    <Wrapper style={styles.wrapper}>
      <TopBar />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <View style={styles.inputField}>
            <Section.Title style={styles.headline}>Summery</Section.Title>
          </View>
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

SendSummery.navigationOptions = {
  title: TITLE
}

export default SendSummery
