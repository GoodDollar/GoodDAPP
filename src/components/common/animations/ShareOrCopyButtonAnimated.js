import React from 'react'
import { isString } from 'lodash'
import useNativeSharing from '../../../lib/hooks/useNativeSharing'
import { isSharingAvailable } from '../../../lib/share'
import { useClipboardCopy } from '../../../lib/hooks/useClipboard'
import ShareButton from './ShareLinkReceiveButton/ShareLinkReceiveButton'
import CopyButton from './ShareLinkSendButton/ShareLinkSendButton'

export const ShareButtonAnimated = ({ shareObject, onShareOrCopy, ...props }) => {
  const shareOrCopy =
    isSharingAvailable || isString(shareObject) ? shareObject : [shareObject.message, shareObject.url].join('\n')
  const shareHandler = useNativeSharing(shareOrCopy, { onSharePress: onShareOrCopy })
  const copyHandler = useClipboardCopy(shareOrCopy, onShareOrCopy)

  return <ShareButton onPress={isSharingAvailable ? shareHandler : copyHandler} {...props} />
}

export const CopyButtonAnimated = ({ shareObject, onShareOrCopy, ...props }) => {
  const shareOrCopy =
    isSharingAvailable || isString(shareObject) ? shareObject : [shareObject.message, shareObject.url].join('\n')
  const shareHandler = useNativeSharing(shareOrCopy, { onSharePress: onShareOrCopy })
  const copyHandler = useClipboardCopy(shareOrCopy, onShareOrCopy)

  return <CopyButton onPress={isSharingAvailable ? shareHandler : copyHandler} {...props} />
}

export default (!isSharingAvailable ? ShareButtonAnimated : CopyButtonAnimated)
