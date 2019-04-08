// @flow

import React from 'react'
import { Button, Paragraph, Text, TextInput } from 'react-native-paper'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'MnemonicInput' })

type Props = {
  onChange: Function
}
const MnemonicInput = (props: Props) => {
  const handleChange = (text: string) => {
    const sanitizedWords = text
      .replace(/[\t\n]+/g, ' ')
      .replace(/<.*>/g, '')
      .replace(/ {2,}/g, ' ')
      .trim()
      .split(' ')

    log.log(text, sanitizedWords)
    if (sanitizedWords.length === 12) {
      props.onChange(sanitizedWords)
    }
  }

  /* TODO: this might require to be refactored to use 12 individual inputs as specified in the mocks */
  return <TextInput multiline={true} numberOfLines={4} onChangeText={handleChange} />
}

export default MnemonicInput
