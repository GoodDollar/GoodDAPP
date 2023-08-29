//@flow
import React from 'react'
import { t } from '@lingui/macro'

import { useInviteCopy, useInviteShare } from '../../../invite/useInvites'
import { ShareInviteButton } from '../../../invite/Invite'

export const useTaskList = () => {
  const { copy: inviteCopy } = useInviteCopy()
  const { share, shareUrl } = useInviteShare()

  // todo: how/where to define current / active task(s)?
  const tasks = [
    {
      id: 'invite',
      title: t`Invite friends`,
      description: inviteCopy,
      actionButton: <ShareInviteButton share={share} shareUrl={shareUrl} />,
      isActive: true,
    },
  ]

  return { tasks }
}
