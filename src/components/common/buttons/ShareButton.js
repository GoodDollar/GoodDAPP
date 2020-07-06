// @flow
import React, { useCallback } from 'react'
import logger from '../../../lib/logger/pino-logger'
import useNativeSharing from '../../../lib/hooks/useNativeSharing'
import CustomButton from './CustomButton'
import CopyButton from './CopyButton'

type ShareButtonProps = {
  share: any,
  onPressDone?: Function,
  actionText: string,
  buttonProps: any,
}

const log = logger.child({ from: 'ShareButton' })

const ShareButton = ({ share, onPressDone, actionText, ...buttonProps }: ShareButtonProps) => {
  const { canShare, shareAction } = useNativeSharing()

  const shareHandler = useCallback(() => {
    log.info('gotPaymentLink', { share })
    shareAction(share)
  }, [shareAction, share])

  if (canShare) {
    return (
      <CustomButton onPress={shareHandler} {...buttonProps}>
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
