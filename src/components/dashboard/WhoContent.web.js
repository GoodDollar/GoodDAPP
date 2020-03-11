import React from 'react'
import { Section } from '../common'
import InputText from '../common/form/InputText'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'

const WhoContent = ({ styles, error, text, setName, value, next }) => {
  return (
    <Section.Stack justifyContent="space-around" style={styles.container}>
      <Section.Title fontWeight="medium">{text}</Section.Title>
      <InputText
        autoFocus
        error={error}
        onChangeText={setName}
        placeholder="Enter the recipient name"
        style={styles.input}
        value={value}
        enablesReturnKeyAutomatically
        onSubmitEditing={next}
        iconName="search"
      />
    </Section.Stack>
  )
}

export default withStyles(({ theme }) => ({
  input: {
    marginTop: 'auto',
  },
  container: {
    minHeight: getDesignRelativeHeight(180),
    height: getDesignRelativeHeight(180),
  },
}))(WhoContent)
