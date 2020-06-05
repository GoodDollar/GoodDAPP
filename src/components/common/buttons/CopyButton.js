import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Icon from '../view/Icon'
import useClipboard from '../../../lib/hooks/useClipboard'
import CustomButton from './CustomButton'

const NOT_COPIED = 'NOT_COPIED'
const COPIED = 'COPIED'
const DONE = 'DONE'
const TRANSITION_TIME = 1000

const CopyButton = ({ toCopy, children, onPress, onPressDone, iconColor, withoutDone, ...props }) => {
  const mode = props.mode || 'contained'
  const [state, setState] = useState(NOT_COPIED)
  const [, setString] = useClipboard()

  const transitionToState = useCallback(() => setState(onPressDone ? DONE : NOT_COPIED), [setState, onPressDone])

  const onPressHandler = useCallback(async () => {
    if (await setString(toCopy)) {
      setState(COPIED)
      onPress && onPress()
    }
  }, [setState, onPress])

  useEffect(() => {
    if (state === 'COPIED' && !withoutDone) {
      setTimeout(transitionToState, TRANSITION_TIME)
    }
  }, [state])

  switch (state) {
    case DONE: {
      return (
        <CustomButton data-gdtype={'copybutton-done'} data-url={toCopy} mode={mode} onPress={onPressDone} {...props}>
          Done
        </CustomButton>
      )
    }
    case COPIED: {
      return (
        <CustomButton data-gdtype={'copybutton-copied'} mode={mode} {...props}>
          <View style={styles.iconButtonWrapper}>
            <Icon size={16} name="success" color={iconColor || 'white'} />
          </View>
        </CustomButton>
      )
    }
    default: {
      return (
        <CustomButton data-gdtype={'copybutton'} mode={mode} onPress={onPressHandler} {...props}>
          {children || 'Copy to Clipboard'}
        </CustomButton>
      )
    }
  }
}

const styles = StyleSheet.create({
  iconButtonWrapper: {
    minHeight: 28,
    justifyContent: 'center',
  },
})

export default CopyButton
