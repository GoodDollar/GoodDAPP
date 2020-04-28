import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
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
  const [state, setState] = useState(NOT_EXECUTED)

  const transitionToState = () => setState(onPressDone ? DONE : EXECUTED)

  useEffect(() => {
    if (state === EXECUTED && !withoutDone) {
      setTimeout(transitionToState, TRANSITION_TIME)
    }
  }, [state])

  const handlePressExecute = useCallback(() => {
    setState(EXECUTED)
    onPress && onPress()
  }, [setState, onPress])

  switch (state) {
    case DONE: {
      return (
        <CustomButton mode={mode} onPress={onPressDone} {...props}>
          Done
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
          {children || 'Confirm'}
        </CustomButton>
      )
    }
  }
}

export default ButtonWithDoneState
