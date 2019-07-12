// @flow
import React from 'react'
import { Route } from '@react-navigation/core'

import CustomButton, { type ButtonProps } from './CustomButton'

type DoneButtonProps = {
  ...ButtonProps,
  routeName?: Route,
  screenProps: { goToRoot: () => void },
}

/**
 * DoneButton
 * This button gets the goToParent action from screenProps. Is meant to be used inside a stackNavigator
 * @param {ButtonProps} props
 */
const DoneButton = (props: DoneButtonProps) => {
  const { screenProps, children } = props

  return (
    <CustomButton {...props} onPress={screenProps.goToRoot}>
      {children || 'Done'}
    </CustomButton>
  )
}

export default DoneButton
