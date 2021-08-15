import { noop } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import Icon from '../view/Icon'
import { useClipboardCopy } from '../../../lib/hooks/useClipboard'
import CustomButton from './CustomButton'

const NOT_COPIED = 'NOT_COPIED'
const COPIED = 'COPIED'
const DONE = 'DONE'
const TRANSITION_TIME = 1000

const CopyButton = ({ toCopy, children, onPress = noop, onPressDone = noop, iconColor, withoutDone, ...props }) => {
  const mode = props.mode || 'contained'
  const [copyState, setCopyState] = useState(NOT_COPIED)

  const onCopiedHandler = useCallback(
    copied => {
      if (!copied) {
        return
      }

      setCopyState(COPIED)
      onPress()
    },
    [setCopyState, onPress],
  )

  const onPressHandler = useClipboardCopy(toCopy, onCopiedHandler)

  const transitionToState = useCallback(() => setCopyState(onPressDone ? DONE : NOT_COPIED), [
    setCopyState,
    onPressDone,
  ])

  useEffect(() => {
    if (copyState === COPIED && !withoutDone) {
      setTimeout(transitionToState, TRANSITION_TIME)
    }

    if (copyState === COPIED && withoutDone) {
      setTimeout(() => setCopyState(NOT_COPIED), TRANSITION_TIME)
    }
  }, [copyState, withoutDone, transitionToState])

  const done = useCallback(onPressDone)

  switch (copyState) {
    case DONE: {
      return (
        <CustomButton dataSet={{ gdtype: 'copybutton-done' }} testID={toCopy} mode={mode} onPress={done} {...props}>
          Done
        </CustomButton>
      )
    }
    case COPIED: {
      return (
        <CustomButton dataSet={{ gdtype: 'copybutton-copied' }} mode={mode} {...props}>
          <Icon size={16} name="success" color={iconColor || 'white'} />
        </CustomButton>
      )
    }
    default: {
      return (
        <CustomButton data={{ gdtype: 'copybutton' }} mode={mode} onPress={onPressHandler} {...props}>
          {children || 'Copy to Clipboard'}
        </CustomButton>
      )
    }
  }
}

export default CopyButton
