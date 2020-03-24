// @flow
import React, { useCallback, useEffect } from 'react'
import { Share } from 'react-native'
import logger from '../../../lib/logger/pino-logger'
import useNativeSharing from '../../../lib/hooks/useNativeSharing'
import { useErrorDialog } from '../../../lib/undux/utils/dialog'
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
  const [showErrorDialog] = useErrorDialog()
  const { canShare } = useNativeSharing()

  useEffect(() => {
    log.info('getPaymentLink', { share })
  }, [])

  const shareAction = useCallback(async () => {
    try {
      await Share.share(share)
    } catch (e) {
      if (e.name !== 'AbortError') {
        showErrorDialog('Sorry, there was an error sharing you link. Please try again later.')
      }
    }
  }, [showErrorDialog])

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
