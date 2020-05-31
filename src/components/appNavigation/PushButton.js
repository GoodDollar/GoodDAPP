// @flow
import React from 'react'
import CustomButton, { type ButtonProps } from '../common/buttons/CustomButton'
import useOnPress from '../../lib/hooks/useOnPress'

type PushButtonProps = {
  ...ButtonProps,
  canContinue?: Function,
  params?: any,
  routeName: Route,
  screenProps: { push: (routeName: string, params: any) => void },
  style?: any,
}

// eslint-disable-next-line require-await
const defaultCanContinue = async () => true

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
export const PushButton = ({
  routeName,
  screenProps,
  params,
  mode = 'contained',
  dark = true,
  canContinue = defaultCanContinue,
  ...props
}: PushButtonProps) => {
  const onPress = useOnPress(async () => {
    if (!screenProps) {
      return
    }

    const couldContinue = await canContinue()

    if (couldContinue) {
      screenProps.push(routeName, params)
    }
  }, [screenProps, canContinue, routeName, params])

  return <CustomButton onPress={onPress} mode={mode} dark={dark} {...props} />
}

PushButton.defaultProps = {
  mode: 'contained',
  dark: true,
  canContinue: () => Promise.resolve(true),
}
