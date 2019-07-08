import React, { useEffect, useState } from 'react'
import Icon from 'react-native-elements/src/icons/Icon'
import { StyleSheet, View } from 'react-native'

import Clipboard from '../../../lib/utils/Clipboard'
import CustomButton from './CustomButton'

const NOT_COPIED = 'NOT_COPIED'
const COPIED = 'COPIED'
const DONE = 'DONE'
const TRANSITION_TIME = 1000

const CopyButton = ({ toCopy, children, onPressDone, ...props }) => {
  const mode = props.mode || 'contained'
  const [state, setState] = useState(NOT_COPIED)

  const transitionToState = () => setState(onPressDone ? DONE : NOT_COPIED)

  useEffect(() => {
    if (state === 'COPIED') {
      setTimeout(transitionToState, TRANSITION_TIME)
    }
  }, [state])

  switch (state) {
    case DONE: {
      return (
        <CustomButton mode={mode} onPress={onPressDone} {...props}>
          Done
        </CustomButton>
      )
    }
    case COPIED: {
      return (
        <CustomButton mode={mode} {...props}>
          <View style={styles.iconButtonWrapper}>
            <Icon size={16} name="done" color="white" />
          </View>
        </CustomButton>
      )
    }
    default: {
      return (
        <CustomButton
          mode={mode}
          onPress={() => {
            Clipboard.setString(toCopy)
            setState(COPIED)
          }}
          {...props}
        >
          {children || 'Copy to Clipboard'}
        </CustomButton>
      )
    }
  }
}

const styles = StyleSheet.create({
  iconButtonWrapper: {
    minHeight: 28,
    justifyContent: 'center'
  }
})

export default CopyButton
