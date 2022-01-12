// @flow
import React from 'react'
import { Paragraph } from 'react-native-paper'
import { View } from 'react-native'

import { getShadowStyles } from '../../../../lib/utils/getStyles'
import { useDialog } from '../../../../lib/undux/utils/dialog'
import { LoginStrategy } from '../sdk/strategies'

import {
  fireEvent,
  SIGNUP_EXISTS,
  SIGNUP_EXISTS_CONTINUE,
  SIGNUP_EXISTS_LOGIN,
} from '../../../../lib/analytics/analytics'

export const useAlreadySignedUp = () => {
  const [showDialog, hideDialog] = useDialog()

  const show = (
    provider,
    existsResult: { provider: string, identifier: boolean, email: boolean, mobile: boolean },
    fromSignupFlow,
  ) => {
    let resolve
    const promise = new Promise((res, rej) => {
      resolve = res
    })

    const registeredBy = LoginStrategy.getTitle(existsResult.provider)
    const usedText = existsResult.identifier ? 'Account' : existsResult.email ? 'Email' : 'Mobile'
    fireEvent(SIGNUP_EXISTS, { provider, existsResult, fromSignupFlow })
    showDialog({
      onDismiss: () => {
        hideDialog()
        resolve('signup')
      },
      content: (
        <View style={alreadyStyles.paragraphContainer}>
          <Paragraph
            style={[alreadyStyles.paragraph, alreadyStyles.paragraphBold]}
          >{`You Already Used\n This ${usedText}\n When You Signed Up\n With ${registeredBy}`}</Paragraph>
        </View>
      ),
      buttons: [
        {
          text: `Login with ${registeredBy}`,
          onPress: () => {
            hideDialog()
            fireEvent(SIGNUP_EXISTS_LOGIN, { provider, existsResult, fromSignupFlow })
            resolve('signin')
          },
          style: [alreadyStyles.marginBottom, getShadowStyles('none')],
        },
        {
          text: 'Continue Signup',
          onPress: () => {
            hideDialog()
            fireEvent(SIGNUP_EXISTS_CONTINUE, { provider, existsResult, fromSignupFlow })
            resolve('signup')
          },
          style: alreadyStyles.whiteButton,
          textStyle: alreadyStyles.primaryText,
        },
      ],
      buttonsContainerStyle: alreadyStyles.modalButtonsContainerStyle,
      type: 'error',
    })
    return promise
  }
  return show
}

const alreadyStyles = {
  paragraphContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalButtonsContainerStyle: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
}
