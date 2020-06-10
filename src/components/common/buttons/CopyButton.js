import { noop } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Icon from '../view/Icon'
import useClipboard from '../../../lib/hooks/useClipboard'
import usePermissions from '../../permissions/hooks/usePermissions'
import useOnPress from '../../../lib/hooks/useOnPress'
import CustomButton from './CustomButton'

const NOT_COPIED = 'NOT_COPIED'
const COPIED = 'COPIED'
const DONE = 'DONE'
const TRANSITION_TIME = 1000

const CopyButton = ({ toCopy, children, onPress = noop, onPressDone = noop, iconColor, withoutDone, ...props }) => {
  const mode = props.mode || 'contained'
  const [copyState, setCopyState] = useState(NOT_COPIED)
  const [, setString] = useClipboard()

  const transitionToState = useCallback(() => setCopyState(onPressDone ? DONE : NOT_COPIED), [
    setCopyState,
    onPressDone,
  ])

  const copyToClipboard = useCallback(async () => {
    if (await setString(toCopy)) {
      setCopyState(COPIED)
    }
  }, [setCopyState, setString, toCopy])

  const [, requestClipboardPermissions] = usePermissions(Permissions.Clipboard, {
    requestOnMounted: false,
    onAllowed: copyToClipboard,
  })

  const onPressHandler = useOnPress(() => {
    requestClipboardPermissions()
    onPress()
  }, [copyToClipboard, onPress])

  useEffect(() => {
    if (copyState === 'COPIED' && !withoutDone) {
      setTimeout(transitionToState, TRANSITION_TIME)
    }
  }, [copyState])

  switch (copyState) {
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
