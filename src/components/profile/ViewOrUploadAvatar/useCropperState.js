import { useCallback, useState } from 'react'

const initialCropperState = { avatar: null, show: false, justUploaded: false }

const useCropperState = () => {
  const [cropperState, setCropperState] = useState(initialCropperState)
  const showCropper = useCallback(
    (avatar, justUploaded = false) => setCropperState({ show: true, avatar, justUploaded }),
    [setCropperState],
  )
  const hideCropper = useCallback(() => setCropperState(initialCropperState), [setCropperState])

  return [cropperState, showCropper, hideCropper]
}

export default useCropperState
