import React, { useState } from 'react'
import { Image, Platform } from 'react-native'

const AutoHeightImage = ({ width, ...props }) => {
  const [aspectRatio, setAspectRatio] = useState(1)

  const onImageLoad = event =>
    setAspectRatio(
      Platform.select({
        web: event.nativeEvent.path?.[0]
          ? event.nativeEvent.path[0].naturalWidth / event.nativeEvent.path[0].naturalHeight
          : 0,
        default: event.nativeEvent.source ? event.nativeEvent.source.width / event.nativeEvent.source.height : 0,
      }),
    )

  return <Image {...props} style={{ width, aspectRatio }} onLoad={onImageLoad} />
}

export default AutoHeightImage
