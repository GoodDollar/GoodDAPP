// @flow
import React from 'react'
import { withStyles } from '../../../lib/styles'
import IconWrapper from './IconWrapper'

const SuccessIcon = ({ theme }) => <IconWrapper iconName="success" color={theme.colors.primary} size={30} />

export default withStyles()(SuccessIcon)
