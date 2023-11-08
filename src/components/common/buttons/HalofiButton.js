import React from 'react'
import { t } from '@lingui/macro'

import { CustomButton } from '../../common'
import { fireEvent } from '../../../lib/analytics/analytics'
import { theme } from '../../theme/styles'
import { openLink } from '../../../lib/utils/linking'
import { isWeb } from '../../../lib/utils/platform'
import { POST_CLAIM_CTA } from '../../../lib/analytics/constants'

const HALOFI_URL = 'https://app.halofi.me/#/challenges?tokensymbol=gd'
const goToHalofi = () => openLink(HALOFI_URL, '_blank')

const HalofiButton = () => {
  const actionText = t`Start Earning Rewards`

  return (
    <CustomButton
      eventType="task"
      styles={{ ...(!isWeb && { width: 250 }) }}
      style={{ minWidth: 70, height: 32, minHeight: 32 }}
      color={theme.colors.primary}
      textStyle={{ fontSize: 14, color: theme.colors.white }}
      onPress={goToHalofi}
      textColor={theme.colors.white}
      onPressed={() => fireEvent(POST_CLAIM_CTA, { type: 'task' })}
      withoutDone
    >
      {actionText}
    </CustomButton>
  )
}

export default HalofiButton
