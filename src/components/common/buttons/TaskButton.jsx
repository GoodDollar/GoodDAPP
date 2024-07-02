import React from 'react'

import { CustomButton } from '..'
import { fireEvent } from '../../../lib/analytics/analytics'
import { theme } from '../../theme/styles'
import { openLink } from '../../../lib/utils/linking'
import { isWeb } from '../../../lib/utils/platform'
import { MIGRATION_ACCEPTED, MIGRATION_DENIED, POST_CLAIM_CTA } from '../../../lib/analytics/constants'
import AsyncStorage from '../../../lib/utils/asyncStorage'

const TaskButton = ({ buttonText, url, eventTag }) => {
  const goToTask = () => {
    fireEvent(POST_CLAIM_CTA, { type: 'task', ...(eventTag && { eventTag }) })
    openLink(url, '_blank')
  }

  return (
    <CustomButton
      eventType="task"
      styles={{ ...(!isWeb && { width: 250 }) }}
      style={{ minWidth: 70, height: 32, minHeight: 32 }}
      color={theme.colors.primary}
      textStyle={{ fontSize: 14, color: theme.colors.white }}
      onPress={goToTask}
      textColor={theme.colors.white}
      withoutDone
    >
      {buttonText}
    </CustomButton>
  )
}

export const WalletV2Continue = ({ buttonText, dontShowAgain, onDismiss, promoUrl }) => {
  const goToWalletV2 = async () => {
    try {
      if (dontShowAgain) {
        fireEvent(MIGRATION_DENIED)
        await AsyncStorage.setItem('dontShowWelcomeOffer', true)
        return
      }

      fireEvent(MIGRATION_ACCEPTED)
      openLink(promoUrl, '_blank')
    } finally {
      onDismiss()
    }
  }

  return (
    <CustomButton
      styles={{ ...(!isWeb && { width: 250 }) }}
      style={{ minWidth: 70, height: 40, minHeight: 32 }}
      color={theme.colors.primary}
      textStyle={{ fontSize: 16, color: theme.colors.white }}
      onPress={goToWalletV2}
      textColor={theme.colors.white}
      withoutDone
    >
      {buttonText}
    </CustomButton>
  )
}

export default TaskButton
