// @flow
import React, { useRef, useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import logger from '../../lib/logger/pino-logger'
import values from 'lodash/values'
const log = logger.child({ from: 'MnemonicInput' })
const MAX_WORDS = 12

type Props = {
  onChange?: Function,
  recoveryMode: any
}

const isValidWord = word => {
  return word !== ''
}

const MnemonicInput = (props: Props) => {
  const [state, setState] = useState({})
  const refs = {}
  for (let i = 0; i < MAX_WORDS; i++) {
    refs[i] = useRef(null)
  }

  useEffect(() => {
    handleChange()
  }, [state])

  useEffect(() => {
    if (props.recoveryMode && state !== props.recoveryMode) {
      log.info({
        recoveryMode: props.recoveryMode,
        different: state !== props.recoveryMode,
        state
      })
      setState(props.recoveryMode)
    }
  }, [props.recoveryMode])

  const handleChange = () => {
    // Each time the state is updated we check if there is a valid mnemonic and execute onChange callback
    const wordsArray = values(state)
    if (wordsArray.length === MAX_WORDS && wordsArray.every(isValidWord)) {
      props.onChange(wordsArray)
    } else {
      props.onChange([])
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
    <View style={styles.inputsContainer}>
      {[...Array(MAX_WORDS).keys()].map(key => (
        <View key={key} style={styles.inputContainer}>
          <View style={styles.prevNumber}>
            <Text>{key + 1}</Text>
          </View>
          <TextInput
            value={state[key] || ''}
            label={key + 1}
            style={styles.input}
            onChange={e => setWord(key)(e.target.value)}
            ref={refs[key]}
            editable={!props.recoveryMode}
          />
        </View>
      ))}
    </View>
  )
}

MnemonicInput.defaultProps = {
  onChange: (words: any) => {}
}

const styles = StyleSheet.create({
  inputsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  inputContainer: {
    width: '45%',
    marginTop: normalize(10),
    height: normalize(40),
    flexDirection: 'row'
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#555',
    borderWidth: StyleSheet.hairlineWidth,
    borderTopRightRadius: normalize(5),
    borderBottomRightRadius: normalize(5),
    height: normalize(40),
    justifyContent: 'center',
    paddingLeft: normalize(16),
    flex: 1,
    width: '100%',
    marginLeft: '-1px'
  },
  prevNumber: {
    borderColor: '#555',
    borderWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: normalize(5),
    borderBottomLeftRadius: normalize(5),
    display: 'flex',
    width: normalize(30),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '0 8px',
    backgroundColor: '#d2d2d2'
  }
})

export default MnemonicInput
