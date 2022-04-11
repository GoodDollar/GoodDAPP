import { assign, isString, noop } from 'lodash'
import { useCallback, useEffect, useRef } from 'react'

import { shareAction } from '../../lib/share/index'
import { useDialog } from '../dialog/useDialog'
import { preventPressed } from './useOnPress'

export default (shareObject, options = null) => {
  const { showErrorDialog } = useDialog()
  const shareOptions = isString(options) ? { customErrorMessage: options } : options
  const { customErrorMessage, onSharePress = noop, onSharingDone = noop } = shareOptions || {}

  const sharingRef = useRef({
    shareObject,
    customErrorMessage,
    showErrorDialog,
    onSharePress,
    onSharingDone,
    isCurrentlySharing: false,
  })

  // should be non-async to avoid possible 'non-user interaction' issues
  const share = useCallback(event => {
    const { current: sharingState } = sharingRef

    const {
      isCurrentlySharing,
      shareObject,
      customErrorMessage,
      showErrorDialog,
      onSharePress,
      onSharingDone,
    } = sharingState

    let sharingPromise

    if (isCurrentlySharing) {
      sharingPromise = Promise.resolve()
    } else {
      sharingState.isCurrentlySharing = true

      sharingPromise = shareAction(shareObject, showErrorDialog, customErrorMessage)
        .then(sharingResult => {
          onSharingDone(sharingResult)

          return sharingResult
        })
        .finally(() => (sharingState.isCurrentlySharing = false))

      onSharePress(event)
    }

    preventPressed(event)
    return sharingPromise
  }, [])

  useEffect(() => {
    assign(sharingRef.current, {
      shareObject,
      customErrorMessage,
      showErrorDialog,
      onSharePress,
      onSharingDone,
    })
  }, [shareObject, options, showErrorDialog])

  return share
}
