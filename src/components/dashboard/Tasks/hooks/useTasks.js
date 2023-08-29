//@flow
import React from 'react'
import { t } from '@lingui/macro'

import { useInviteCopy, useInviteShare } from '../../../invite/useInvites'
import { ShareInviteButton } from '../../../invite/Invite'
import { isSharingAvailable } from '../../../../lib/share'

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
      actionButton: <ShareInviteButton share={share} altCopy={actionText} />,
      isActive: true,
    },
  ]

  return { tasks }
}
