import { useCallback } from 'react'
import canShare from '../../lib/utils/canShare'
import {
  generateCode,
  generateReceiveShareObject,
  generateReceiveShareText,
  generateSendShareObject,
  generateSendShareText,
  generateShareLink,
  shareAction as importedShareAction,
} from '../../lib/share/index'
import { useErrorDialog } from '../undux/utils/dialog'

const _canShare = canShare()

export default () => {
  const [showErrorDialog] = useErrorDialog()

  const _shareAction = useCallback(
    (shareObj, customErrorMessage) => {
      importedShareAction(shareObj, showErrorDialog, customErrorMessage)
    },
    [showErrorDialog],
  )

  return {
    canShare: _canShare,
    generateReceiveShareObject,
    generateReceiveShareText,
    generateCode,
    generateSendShareObject,
    generateSendShareText,
    generateShareLink,
    shareAction: _shareAction,
  }
}
