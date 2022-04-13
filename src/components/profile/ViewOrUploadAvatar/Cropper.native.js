import { Platform } from 'react-native'
import { useCallback, useEffect } from 'react'
import ImagePicker from 'react-native-image-crop-picker'

import useRealtimeProps from '../../../lib/hooks/useRealtimeProps'

import { assembleDataUrl } from '../../../lib/utils/base64'
import { withTemporaryFile } from '../../../lib/utils/fs'

// eslint-disable-next-line require-await
const crop = async (path, options) => ImagePicker.openCropper({ ...options, path })

const Cropper = ({ pickerOptions, avatar, onCropped }) => {
  // eslint-disable-next-line require-await
  const _crop = useCallback(async path => crop(path, pickerOptions), [pickerOptions])
  const accessors = useRealtimeProps([avatar, _crop, onCropped])

  useEffect(() => {
    const [getAvatar, openCropper, runCallback] = accessors
    const avatar = getAvatar()

    // iOS supports reading from a base64 string, android does not.
    Platform.select({
      // eslint-disable-next-line require-await
      android: async () => withTemporaryFile(avatar, async ({ uri }) => openCropper(uri)),
      // eslint-disable-next-line require-await
      default: async () => openCropper(avatar),
    })().then(({ mime, data }) => runCallback(assembleDataUrl(data, mime)))
  }, [accessors])

  return null
}

export default Cropper
