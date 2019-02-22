// @flow
import React, { useCallback, useState } from 'react'
import { Text, View } from 'react-native'
import { TextInput } from 'react-native-paper'

import { Section, Wrapper } from '../common'
import { BackButton, NextButton } from '../appNavigation/stackNavigation'
import { receiveStyles as styles } from './styles'
import TopBar from '../common/TopBar'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send GD'

const SendReason = (props: AmountProps) => {
  const { screenProps, navigation } = props
  const { setScreenState, screenState } = screenProps
  const amount = navigation.getParam('amount', 0)

  const { reason } = screenState

  return (
    <Wrapper style={styles.wrapper}>
      <TopBar />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <View style={styles.inputField}>
            <Section.Title style={styles.headline}>For?</Section.Title>
            <TextInput focus={true} value={reason} onChangeText={reason => setScreenState({ reason })} />
          </View>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <NextButton value={reason} {...props} />
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

SendReason.navigationOptions = {
  title: TITLE
}

export default SendReason
