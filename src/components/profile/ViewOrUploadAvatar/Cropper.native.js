import { Platform } from 'react-native'
import { useCallback, useEffect } from 'react'
import ImagePicker from 'react-native-image-crop-picker'

import useRealtimeProps from '../../../lib/hooks/useRealtimeProps'

import { assembleDataUrl } from '../../../lib/utils/base64'
import { withTemporaryFile } from '../../../lib/utils/fs'

const Cropper = ({ pickerOptions, avatar, onCropped, onCancelled }) => {
  const openCropper = useCallback(
    // eslint-disable-next-line require-await
    async path => ImagePicker.openCropper({ ...pickerOptions, path }),
    [pickerOptions],
  )

  const accessors = useRealtimeProps([avatar, openCropper, onCropped, onCancelled])

  useEffect(() => {
    const [getAvatar, openCropper, onCropped, onCancelled] = accessors
    const avatar = getAvatar()

    // iOS supports reading from a base64 string, android does not.
    Platform.select({
      // eslint-disable-next-line require-await
      android: async () => withTemporaryFile(avatar, async ({ uri }) => openCropper(uri)),
      // eslint-disable-next-line require-await
      default: async () => openCropper(avatar),
    })()
      .then(({ mime, data }) => onCropped(assembleDataUrl(data, mime)))
      .catch(() => onCancelled())
  }, [accessors])

  return null
}

export default Cropper
