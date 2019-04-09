// @flow

import React, { useState, useRef, useEffect } from 'react'
import { TextInput } from 'react-native-paper'
import { View, StyleSheet } from 'react-native'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'MnemonicInput' })

type Props = {
  onChange: Function
}

const isValidWord = word => {
  return word != ''
}

const MnemonicInput = (props: Props) => {
  const [state, setState] = useState({})
  const refs = {}
  for (let i = 0; i < 12; i++) {
    refs[i] = useRef(null)
  }
  const handleChange = () => {
    log.info({ state })
    const wordsArray = Object.values(state)
    if (wordsArray.length === 12 && wordsArray.every(isValidWord)) {
      props.onChange(wordsArray)
    }
  }

  const setWord = index => text => {
    const words = text.split(' ')
    if (words.length > 1) {
      const newState = { ...state }
      for (let i = index; i < words.length && i < 12; i++) {
        newState[i] = words[i]
      }
      setState(newState)
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
      {[...Array(12).keys()].map(key => (
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
