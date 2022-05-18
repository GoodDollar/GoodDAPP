import { get } from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Image as NativeImage, StyleSheet } from 'react-native'

import usePropsRefs from '../../../lib/hooks/usePropsRefs'
import logger from '../../../lib/logger/js-logger'

const log = logger.child({ from: 'Image' })

const isAutoHeight = ({ width, height }) => !!width && 'auto' === height

const Image = ({ style = {}, source, ...props }) => {
  const [aspectRatio, setAspectRatio] = useState()
  const flattenStyle = useMemo(() => StyleSheet.flatten(style), [style])
  const refs = usePropsRefs([flattenStyle])

  // image source could be base64 data uri
  const uri = useMemo(() => get(source, 'uri', source), [source])

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

  useEffect(() => {
    const onImageSize = (width, height) => {
      const [getStyle] = refs

      if (isAutoHeight(getStyle())) {
        setAspectRatio(width / height)
      }
    }

    setAspectRatio(undefined)
    NativeImage.getSize(uri, onImageSize, e => log.error('Get image size error', e.message, e))
  }, [uri, setAspectRatio, refs])

  if (!aspectRatio) {
    return null
  }

  return <NativeImage {...props} source={source} style={imageStyle} />
}

export default Image
