import canShare from '../../lib/utils/canShare'
import {
  generateCode,
  generateReceiveShareObject,
  generateReceiveShareText,
  generateSendShareObject,
  generateSendShareText,
  generateShareLink,
} from '../../lib/share'

const _canShare = canShare()

export default () => {
  return {
    canShare: _canShare,
    generateReceiveShareObject,
    generateReceiveShareText,
    generateCode,
    generateSendShareObject,
    generateSendShareText,
    generateShareLink,
  }
}
