// @flow
import values from 'lodash/values'
import React, { createRef, useEffect, useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'
import { getScreenHeight } from '../../lib/utils/Orientation'
import { Text } from '../common'

const height = getScreenHeight()

const log = logger.child({ from: 'MnemonicInput' })
const MAX_WORDS = 12

type Props = {
  onChange?: Function,
  recoveryMode: any,
}

const isValidWord = word => {
  return word !== ''
}

const MnemonicInput = ({ onChange, recoveryMode, styles }: Props) => {
  const [state, setState] = useState({})
  const refs = {}

  for (let i = 0; i < MAX_WORDS; i++) {
    refs[i] = createRef()
  }

  useEffect(() => {
    handleChange()
  }, [state])

  useEffect(() => {
    if (recoveryMode && state !== recoveryMode) {
      log.info({
        recoveryMode: recoveryMode,
        different: state !== recoveryMode,
        state,
      })
      setState(recoveryMode)
    }
  }, [recoveryMode])

  const handleChange = () => {
    // Each time the state is updated we check if there is a valid mnemonic and execute onChange callback
    const wordsArray = values(state)
    if (wordsArray.length === MAX_WORDS && wordsArray.every(isValidWord)) {
      onChange(wordsArray)
    } else {
      onChange([])
    }
  }

  const setWord = index => text => {
    // If there is more than one word we want to put each word in his own input
    // We also want to move focus to next word
    const splitted = text.split(' ')

    if (splitted.length > 1) {
      const words = splitted.filter(word => word !== '')

      const newState = { ...state }
      for (let i = 0; i < words.length; i++) {
        if (i + index < MAX_WORDS) {
          log.info(newState[i + index], words[i])
          newState[i + index] = words[i]
        }
      }

      // If last word is empty means we need to consider length-1 as pos to focus on next
      const pos = splitted.length > words.length ? words.length : words.length + 1
      const next = Math.min(pos + index, MAX_WORDS - 1)
      refs[next].current.focus()
      setState(newState)
    } else {
      const newState = { ...state, [index]: text.trim() }
      setState(newState)
    }
  }

  return (
    <>
      {[...Array(MAX_WORDS).keys()].map(key => (
        <View key={key} style={styles.inputContainer}>
          <View style={styles.prevNumber}>
            <Text color="surface">{key + 1}</Text>
          </View>
          <TextInput
            value={state[key] || ''}
            label={key + 1}
            style={styles.input}
            onChange={e => setWord(key)(e.target.value)}
            ref={refs[key]}
            editable={!recoveryMode}
          />
        </View>
      ))}
    </>
  )
}

MnemonicInput.defaultProps = {
  onChange: (words: any) => {},
}

const mnemonicInputStyles = ({ theme }) => ({
  inputContainer: {
    width: '45%',
    marginTop: normalize(10),
    height: normalize(height >= 640 ? 44 : 36),
    flexDirection: 'row',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopRightRadius: normalize(22),
    borderBottomRightRadius: normalize(22),
    height: normalize(height >= 640 ? 44 : 36),
    paddingLeft: normalize(16),
    width: normalize(94),
    justifyContent: 'center',
    flex: 1,
  },
  prevNumber: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: normalize(22),
    borderBottomLeftRadius: normalize(22),
    display: 'flex',
    width: normalize(32),
    height: normalize(height >= 640 ? 44 : 36),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '0 8px',
  },
})

export default withStyles(mnemonicInputStyles)(MnemonicInput)
