import { useEffect, useState } from 'react'
import { Image } from 'react-native'

const useImageAspectRatio = imageUrl => {
  const [aspectRatio, setAspectRatio] = useState(1)

  useEffect(() => {
    if (!imageUrl) {
      return
    }

    let isValid = true
    Image.getSize(imageUrl, (width, height) => {
      if (isValid) {
        setAspectRatio(width / height)
      }
    })

    return () => {
      isValid = false
    }
  }, [imageUrl])

  return aspectRatio
}

export default useImageAspectRatio
