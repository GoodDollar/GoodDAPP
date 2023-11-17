//@flow
import React from 'react'
import { t } from '@lingui/macro'

import { useInviteCopy, useInviteShare } from '../../../invite/useInvites'
import { ShareInviteButton } from '../../../invite/Invite'
import { isSharingAvailable } from '../../../../lib/share'
import { isWeb } from '../../../../lib/utils/platform'
import HalofiButton from '../../../common/buttons/HalofiButton'

export const useTaskList = () => {
  const { copy: inviteCopy } = useInviteCopy()
  const { share } = useInviteShare()
  const actionText = isSharingAvailable ? t`Share invite Link` : t`Copy invite link`

  // todo: how/where to define current / active task(s)?
  const tasks = [
    {
      id: 'invite',
      title: t`Invite friends`,
      description: inviteCopy,
      actionButton: (
        <ShareInviteButton
          eventType="task"
          share={share}
          altCopy={actionText}
          styles={{ ...(!isWeb && { width: 250 }) }}
        />
      ),
      isActive: false,
    },
    {
      id: 'halofi',
      title: t`Invite friends`,
      description: t`Save your G$ and earn rewards with GoodDollar saving challenges with HaloFi`,
      actionButton: <HalofiButton />,
      isActive: true,
    },
  ]

  return { tasks }
}
