import { isString, noop } from 'lodash'
import { useCallback, useEffect, useRef } from 'react'

import { shareAction } from '../../lib/share/index'
import { useErrorDialog } from '../undux/utils/dialog'
import { preventPressed } from './useOnPress'

export default (shareObject, options = null) => {
  const [showErrorDialog] = useErrorDialog()
  const shareOptions = isString(options) ? { customErrorMessage: options } : options
  const { customErrorMessage, onSharePress = noop, onSharingDone = noop } = shareOptions || {}

  const sharingRef = useRef({
    shareObject,
    customErrorMessage,
    showErrorDialog,
    onSharePress,
    onSharingDone,
  })

  // should be non-async to avoid possible 'non-user interaction' issues
  const share = useCallback(event => {
    const { shareObject, customErrorMessage, showErrorDialog, onSharePress, onSharingDone } = sharingRef.current

    const sharingPromise = shareAction(shareObject, showErrorDialog, customErrorMessage).then(sharingResult => {
      onSharingDone(sharingResult)

      return sharingResult
    })

    onSharePress(event)
    preventPressed(event)

    return sharingPromise
  }, [])

  useEffect(() => {
    sharingRef.current = {
      shareObject,
      customErrorMessage,
      showErrorDialog,
      onSharePress,
      onSharingDone,
    }
  }, [shareObject, options, showErrorDialog])

  return share
}
