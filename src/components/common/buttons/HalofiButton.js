import React from 'react'
import { t } from '@lingui/macro'

import { CustomButton } from '../../common'
import { fireEvent } from '../../../lib/analytics/analytics'
import { theme } from '../../theme/styles'
import { openLink } from '../../../lib/utils/linking'
import { isWeb } from '../../../lib/utils/platform'
import { POST_CLAIM_CTA } from '../../../lib/analytics/constants'

const HALOFI_URL =
  'https://www.notion.so/gooddollar/New-HaloFi-savings-challenge-Use-your-G-holdings-to-earn-more-G-358132696c4a4134b95f3da21274de39?pvs=4'
const goToHalofi = () => {
  fireEvent(POST_CLAIM_CTA, { type: 'task' })
  openLink(HALOFI_URL, '_blank')
}

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
      withoutDone
    >
      {actionText}
    </CustomButton>
  )
}

export default HalofiButton
