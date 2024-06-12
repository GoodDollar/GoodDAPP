// @flow
import React from 'react'
import { withStyles } from '../../../lib/styles'
import IconWrapper from './IconWrapper'

const ErrorIcon = ({ theme }) => <IconWrapper iconName="close" color={theme.colors.error} size={30} />

export default withStyles()(ErrorIcon)
