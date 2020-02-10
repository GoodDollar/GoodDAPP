import React, { useEffect, useState } from 'react'
import Icon from '../view/Icon'

import Clipboard from '../../../lib/utils/Clipboard'
import CustomButton from './CustomButton'

const NOT_COPIED = 'NOT_COPIED'
const COPIED = 'COPIED'
const DONE = 'DONE'
const TRANSITION_TIME = 1000

const CopyButton = ({ toCopy, children, onPress, onPressDone, iconColor, withoutDone, ...props }) => {
  const mode = props.mode || 'contained'
  const [state, setState] = useState(NOT_COPIED)

  const transitionToState = () => setState(onPressDone ? DONE : NOT_COPIED)

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
          <Icon size={16} name="success" color={iconColor || 'white'} />
        </CustomButton>
      )
    }
    default: {
      return (
        <CustomButton
          data-gdtype={'copybutton'}
          mode={mode}
          onPress={() => {
            Clipboard.setString(toCopy)
            setState(COPIED)
            onPress && onPress()
          }}
          {...props}
        >
          {children || 'Copy to Clipboard'}
        </CustomButton>
      )
    }
  }
}

export default CopyButton
