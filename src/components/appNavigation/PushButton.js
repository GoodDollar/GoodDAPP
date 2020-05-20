// @flow
import React from 'react'
import CustomButton, { type ButtonProps } from '../common/buttons/CustomButton'

type PushButtonProps = {
  ...ButtonProps,
  canContinue?: Function,
  params?: any,
  routeName: Route,
  screenProps: { push: (routeName: string, params: any) => void },
  style?: any,
}

/**
 * PushButton
 * This button gets the push action from screenProps. Is meant to be used inside a stackNavigator
 * @param {PushButtonProps} args
 * @param {string} args.routeName
 * @param {object} args.screenProps
 * @param {Function|undefined} args.canContinue
 * @param {object} args.params
 * @param {ButtonProps} props
 */
export const PushButton = ({ routeName, screenProps, canContinue, params, ...props }: PushButtonProps) => (
  <CustomButton
    onPress={async e => {
      e.preventDefault()
      screenProps && (await canContinue()) && screenProps.push(routeName, params)
    }}
    {...props}
  />
)

PushButton.defaultProps = {
  mode: 'contained',
  dark: true,
  canContinue: () => Promise.resolve(true),
}
