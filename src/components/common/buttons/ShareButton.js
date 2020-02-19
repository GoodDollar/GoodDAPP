// @flow
import React from 'react'
import { Share } from 'react-native'
import canShare from '../../../lib/utils/canShare'
import { useErrorDialog } from '../../../lib/undux/utils/dialog'
import CustomButton from './CustomButton'
import CopyButton from './CopyButton'

type ShareButtonProps = {
  share: any,
  onPressDone?: Function,
  actionText: string,
  buttonProps: any,
}

const ShareButton = ({ share, onPressDone, actionText, ...buttonProps }: ShareButtonProps) => {
  const [showErrorDialog] = useErrorDialog()

  console.info('getPaymentLink', { share })
  const shareAction = async () => {
    try {
      await Share.share(share)
    } catch (e) {
      if (e.name !== 'AbortError') {
        showErrorDialog('Sorry, there was an error sharing you link. Please try again later.')
      }
    }
  }

  if (canShare) {
    return (
      <CustomButton onPress={shareAction} {...buttonProps}>
        {actionText}
      </CustomButton>
    )
  }
  return (
    <CopyButton toCopy={share.url} onPressDone={onPressDone} {...buttonProps}>
      {actionText}
    </CopyButton>
  )
}

ShareButton.defaultProps = {
  buttonProps: {},
}

export default ShareButton
