import React from 'react'
import { HelperText } from 'react-native-paper'
import { withStyles } from '../../../lib/styles'

const ErrorText = ({ error, styles, style }) =>
  !error ? null : (
    <HelperText type="error" style={[styles.error, { opacity: error ? 1 : 0 }, style]}>
      {error}
    </HelperText>
  )

const getStylesFromProps = ({ theme }) => ({
  error: {
    color: theme.colors.googleRed,
    fontSize: 14,
    height: 18,
    marginTop: 12,
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
    textAlign: 'center',
  },
})

export default withStyles(getStylesFromProps)(ErrorText)
