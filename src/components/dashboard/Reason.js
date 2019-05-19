// @flow
import React, { useState } from 'react'
import { View } from 'react-native'
import { TextInput } from 'react-native-paper'

import { Section, Wrapper } from '../common'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { receiveStyles as styles } from './styles'
import TopBar from '../common/TopBar'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send G$'

const SendReason = (props: AmountProps) => {
  const { screenProps } = props

  const [screenState, setScreenState] = useScreenState(screenProps)
  const [reason, setReason] = useState(screenState.reason)
  const { amount, to } = screenState

  return (
    <Wrapper style={styles.wrapper}>
      <TopBar push={screenProps.push} />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <View style={styles.inputField}>
            <Section.Title style={styles.headline}>What For?</Section.Title>
            <TextInput
              autoFocus
              value={reason}
              onChangeText={reason => setReason(reason)}
              placeholder="Add a message"
            />
          </View>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <NextButton
              nextRoutes={screenState.nextRoutes}
              values={{ amount, reason, to }}
              {...props}
              label={reason ? 'Next' : 'Skip'}
            />
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

SendReason.navigationOptions = {
  title: TITLE
}

SendReason.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.amount >= 0 && screenState.nextRoutes
}

export default SendReason
