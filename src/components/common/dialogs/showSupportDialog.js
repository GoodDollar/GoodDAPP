//@flow

import { noop } from 'lodash'
import React from 'react'
import { View } from 'react-native'
import { t, Trans } from '@lingui/macro'
import Text from '../view/Text'

export const showSupportDialog = (
  showErrorDialog,
  hideDialog,
  push,
  message = t`Something went wrong on our side. Please try again`,
  onDismiss = null,
) => {
  const wrapperStyles = {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  }

  showErrorDialog(message, undefined, {
    onDismiss: onDismiss || noop,
    boldMessage: (
      <View style={wrapperStyles}>
        <Trans>
          <Text fontWeight="inherit">{t`Or contact `}</Text>
          <Text
            fontWeight="inherit"
            textDecorationLine="underline"
            onPress={() => {
              hideDialog()
              push('Support')
            }}
          >
            support
          </Text>
        </Trans>
      </View>
    ),
  })
}
