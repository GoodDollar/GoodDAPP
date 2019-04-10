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
  return word != ''
}

const MnemonicInput = (props: Props) => {
  const [state, setState] = useState({})
  const refs = {}
  for (let i = 0; i < MAX_WORDS; i++) {
    refs[i] = useRef(null)
  }
  const handleChange = () => {
    // Each time the state is updated we check if there is a valid mnemonic and execute onChange callback
    const wordsArray = Object.values(state)
    if (wordsArray.length === MAX_WORDS && wordsArray.every(isValidWord)) {
      props.onChange(wordsArray)
    }
  }

  const setWord = index => text => {
    // If there is more than one word we want to put each word in his own input
    // We also want to move focus to next word
    const words = text.split(' ')
    if (words.length > 1) {
      const newState = { ...state }
      for (let i = index; i < words.length && i < MAX_WORDS; i++) {
        newState[i] = words[i]
      }
      setState(newState)

      // If last word is empty means we need to consider length-1 as pos to focus on next
      const pos = words[words.length - 1] === '' ? words.length - 1 : words.length
      const next = Math.min(pos + index, 11)
      refs[next].current.focus()
    } else {
      const newState = { ...state, [index]: text.trim() }
      setState(newState)
    }
  }

  handleChange()

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
    justifyContent: 'space-around'
  },
  input: {
    width: '45%',
    marginTop: '1em'
  }
})

export default MnemonicInput
