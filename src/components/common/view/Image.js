import { get, isString } from 'lodash'
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

  // image source could be base64 data uri
  const uri = useMemo(() => get(source, 'uri', isString(source) ? source : null), [source])
  const fixed = !isAutoHeight(flattenStyle)

  const imageStyle = useMemo(() => {
    return fixed
      ? flattenStyle
      : {
          ...style,
          aspectRatio,
        }
  }, [flattenStyle, aspectRatio])

  useEffect(() => {
    const onImageSize = (width, height) => setAspectRatio(width / height)

    if (!mountedState.current || !uri || fixed) {
      return
    }

    NativeImage.getSize(uri, onImageSize, e => log.error('Get image size error', e?.message, e, { uri }))
  }, [uri, fixed])

  if (!aspectRatio && !fixed) {
    return null
  }

  return <NativeImage {...props} source={source} style={imageStyle} />
}

export default Image
