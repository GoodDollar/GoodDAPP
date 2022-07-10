import { get } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import { Image as NativeImage, StyleSheet } from 'react-native'
import useMountedState from '../../../lib/hooks/useMountedState'
import logger from '../../../lib/logger/js-logger'

const log = logger.child({ from: 'Image' })

const isAutoHeight = ({ width, height }) => !!width && 'auto' === height

const Image = ({ style = {}, source, ...props }) => {
  const mountedState = useMountedState()
  const [aspectRatio, setAspectRatio] = useState()
  const flattenStyle = useMemo(() => StyleSheet.flatten(style), [style])

  const fixed = !isAutoHeight(flattenStyle)

  // image source could be base64 data uri
  const uri = useMemo(() => get(source, 'uri', typeof source === 'string' && source), [source])

  const imageStyle = useMemo(() => {
    return fixed
      ? flattenStyle
      : {
          ...style,
          aspectRatio,
        }
  }, [flattenStyle, aspectRatio])

  useEffect(() => {
    const onImageSize = (width, height) => {
      mountedState.current && setAspectRatio(width / height)
    }

    if (uri && !fixed) {
      mountedState.current &&
        NativeImage.getSize(uri, onImageSize, e => log.error('Get image size error', e?.message, e, { uri }))
    }
  }, [uri, fixed, mountedState])

  if (!aspectRatio && !fixed) {
    return null
  }

  return <NativeImage {...props} source={source} style={imageStyle} />
}

export default Image
