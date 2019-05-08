// @flow

import React, { useState, useRef, useEffect } from 'react'
import { TextInput } from 'react-native-paper'
import { View, StyleSheet } from 'react-native'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'MnemonicInput' })
const MAX_WORDS = 12

type Props = {
  onChange: Function
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

  const handleChange = () => {
    // Each time the state is updated we check if there is a valid mnemonic and execute onChange callback
    const wordsArray = Object.values(state)
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
        <TextInput
          value={state[key] || ''}
          label={key + 1}
          type="outlined"
          key={key}
          style={styles.input}
          onChange={e => setWord(key)(e.target.value)}
          ref={refs[key]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  inputsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  input: {
    width: '45%',
    marginTop: '1em'
  }
})

export default MnemonicInput
