import React from 'react'
import { Wrapper, TopBar } from '../common'
import { StyleSheet, Text } from 'react-native'

import logger from '../../lib/logger/pino-logger'

const SEND_TITLE = 'Send GD'

const log = logger.child({ from: SEND_TITLE })

const Send = props => {
  return (
    <Wrapper>
      <TopBar />
      <Text>Send</Text>
    </Wrapper>
  )
}

Send.navigationOptions = {
  title: SEND_TITLE
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'flex-start',
    width: '100%',
    padding: '1rem'
  }
})

export default Send
