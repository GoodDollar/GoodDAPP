// @flow
import React from 'react'
import { isMobile } from 'mobile-device-detect'
import { fireEvent } from '../../../lib/analytics/analytics'
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
      fireEvent('MOBILE_SHARE_LINK', share)
      await navigator.share(share)
    } catch (e) {
      fireEvent('ERROR_MOBILE_SHARE_LINK', e.message)
      if (e.name !== 'AbortError') {
        showErrorDialog('Sorry, there was an error sharing you link. Please try again later.')
      }
    }
  }

  if (isMobile && navigator.share) {
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
