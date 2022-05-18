import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Image as NativeImage, StyleSheet } from 'react-native'

import usePropsRefs from '../../../lib/hooks/usePropsRefs'
import logger from '../../../lib/logger/js-logger'

const log = logger.child({ from: 'Image' })

const isAutoHeight = ({ width, height }) => !!width && 'auto' === height

const Image = ({ style = {}, source = {}, ...props }) => {
  const { uri } = source
  const [aspectRatio, setAspectRatio] = useState()
  const flattenStyle = useMemo(() => StyleSheet.flatten(style), [style])
  const refs = usePropsRefs([flattenStyle])

  const imageStyle = useMemo(() => {
    const { height, ...style } = flattenStyle
    const fixed = !isAutoHeight(flattenStyle)

    return fixed
      ? flattenStyle
      : {
          ...style,
          aspectRatio,
        }
  }, [flattenStyle, aspectRatio])

  const onImageSize = useCallback(
    (width, height) => {
      const [getStyle] = refs

      if (isAutoHeight(getStyle())) {
        setAspectRatio(width / height)
      }
    },
    [setAspectRatio, refs],
  )

  const onImageSizeError = error => log.error('Get image size error', error)

  //prettier-ignore
  useEffect(() =>
    NativeImage.getSize(uri, onImageSize, onImageSizeError),
    [onImageSize, uri]
  )

  return <NativeImage {...props} source={source} style={imageStyle} />
}

export default Image
