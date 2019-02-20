import React, { useCallback, useMemo, useState } from 'react'
import { Wrapper, TopBar } from '../common'
import { StyleSheet, Text } from 'react-native'
import { AccountConsumer } from '../appNavigation/AccountProvider'

import logger from '../../lib/logger/pino-logger'

const SEND_TITLE = 'Send GD'

const log = logger.child({ from: SEND_TITLE })

const Send = props => {
  return (
    <AccountConsumer>
      {({ balance }) => (
        <Wrapper>
          <TopBar balance={balance} />
          <Text>Send</Text>
        </Wrapper>
      )}
    </AccountConsumer>
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
