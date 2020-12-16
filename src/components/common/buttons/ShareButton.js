// @flow

import React, { useEffect } from 'react'
import { noop } from 'lodash'

import logger from '../../../lib/logger/pino-logger'

import useNativeSharing from '../../../lib/hooks/useNativeSharing'
import { isSharingAvailable } from '../../../lib/share'
import CustomButton from './CustomButton'
import CopyButton from './CopyButton'

type ShareButtonProps = {
  share: any,
  onPressDone?: Function,
  onPressed?: Function,
  actionText: string,
  buttonProps: any,
}

const log = logger.child({ from: 'ShareButton' })
const SharingButton = isSharingAvailable ? CustomButton : CopyButton

const ShareButton = ({ share, onPressed = noop, actionText, ...buttonProps }: ShareButtonProps) => {
  const shareHandler = useNativeSharing(share, { onSharePress: onPressed })
  const shareOrCopy = isSharingAvailable ? share : [share.title, share.message, share.url].join('\n')

  useEffect(() => {
    log.info('getPaymentLink', { share })
  }, [])

  return (
    <SharingButton {...buttonProps} toCopy={shareOrCopy} onPress={isSharingAvailable ? shareHandler : onPressed}>
      {actionText}
    </SharingButton>
  )
}

export default ShareButton
