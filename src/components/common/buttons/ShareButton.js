// @flow

import React, { useEffect } from 'react'
import { isString, noop } from 'lodash'

import logger from '../../../lib/logger/js-logger'

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

const log = logger.get('ShareButton')
const SharingButton = isSharingAvailable ? CustomButton : CopyButton

const ShareButton = ({ share, onPressed = noop, actionText, ...buttonProps }: ShareButtonProps) => {
  const shareHandler = useNativeSharing(share, { onSharePress: onPressed })
  const shareOrCopy = isSharingAvailable || isString(share) ? share : [share.message, share.url].join('\n')

  useEffect(() => {
    log.info('Copy/ShareButton', { share, shareOrCopy, isSharingAvailable })
  }, [])

  return (
    <SharingButton {...buttonProps} toCopy={shareOrCopy} onPress={isSharingAvailable ? shareHandler : onPressed}>
      {actionText}
    </SharingButton>
  )
}

export default ShareButton
