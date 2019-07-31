// @flow
import React from 'react'
import CustomButton, { type ButtonProps } from '../common/buttons/CustomButton'

type PushButtonProps = {
  ...ButtonProps,
  canContinue?: Function,
  params?: any,
  routeName: Route,
  screenProps: { push: (routeName: string, params: any) => void },
}

/**
 * PushButton
 * This button gets the push action from screenProps. Is meant to be used inside a stackNavigator
 * @param routeName
 * @param screenProps
 * @param params
 * @param {ButtonProps} props
 */
export const PushButton = ({ routeName, screenProps, canContinue, params, style, ...props }: PushButtonProps) => {
  const shouldContinue = async () => {
    if (canContinue === undefined) {
      return true
    }

    const result = await canContinue()
    return result
  }

  return (
    <CustomButton
      style={style}
      onPress={async () => screenProps && (await shouldContinue()) && screenProps.push(routeName, params)}
      {...props}
    />
  )
}

PushButton.defaultProps = {
  mode: 'contained',
  dark: true,
  canContinue: () => true,
}
