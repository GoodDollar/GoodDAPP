import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { t, Trans } from '@lingui/macro'
import Icon from '../view/Icon'
import CustomButton from './CustomButton'

const NOT_EXECUTED = 'NOT_EXECUTED'
const EXECUTED = 'EXECUTED'
const DONE = 'DONE'
const TRANSITION_TIME = 1000

const styles = StyleSheet.create({
  iconButtonWrapper: {
    minHeight: 28,
    justifyContent: 'center',
  },
})

const ButtonWithDoneState = ({ toCopy, children, onPress, onPressDone, iconColor, withoutDone, ...props }) => {
  const mode = props.mode || 'contained'
  const [status, setStatus] = useState(NOT_EXECUTED)

  const transitionToState = () => setStatus(onPressDone ? DONE : EXECUTED)

  useEffect(() => {
    if (status === EXECUTED && !withoutDone) {
      setTimeout(transitionToState, TRANSITION_TIME)
    }
  }, [status])

  const handlePressExecute = useCallback(() => {
    setStatus(EXECUTED)
    onPress && onPress()
  }, [setStatus, onPress])

  const done = useCallback(onPressDone)

  switch (status) {
    case DONE: {
      return (
        <CustomButton mode={mode} onPress={done} {...props}>
          <Trans>Done</Trans>
        </CustomButton>
      )
    }
    case EXECUTED: {
      return (
        <CustomButton mode={mode} {...props}>
          <View style={styles.iconButtonWrapper}>
            <Icon size={16} name="success" color={iconColor || 'white'} />
          </View>
        </CustomButton>
      )
    }
    default: {
      return (
        <CustomButton mode={mode} onPress={handlePressExecute} {...props}>
          {children || t`Confirm`}
        </CustomButton>
      )
    }
  }
}

export default ButtonWithDoneState
