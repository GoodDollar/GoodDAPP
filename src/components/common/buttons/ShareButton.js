// @flow
import React, { useCallback, useEffect } from 'react'
import { get, isString } from 'lodash'

import logger from '../../../lib/logger/pino-logger'
import useNativeSharing from '../../../lib/hooks/useNativeSharing'
import useOnPress from '../../../lib/hooks/useOnPress'
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
  const shareUrl = isString(share) ? share : get(share, 'url', null)

  useEffect(() => {
    log.info('getPaymentLink', { share })
  }, [])

  const shareHandler = useOnPress(() => shareAction(share), [shareAction, share])

  return canShare ? (
    <CustomButton onPress={shareHandler} {...buttonProps}>
      {actionText}
    </CustomButton>
  ) : (
    <CopyButton toCopy={shareUrl} onPressDone={onPressDone} {...buttonProps}>
      {actionText}
    </CopyButton>
  )
}

export default ShareButton
