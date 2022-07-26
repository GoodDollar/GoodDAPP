import { get, isString } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import { Image as NativeImage, StyleSheet } from 'react-native'

import useMountedState from '../../../lib/hooks/useMountedState'
import logger from '../../../lib/logger/js-logger'

const log = logger.child({ from: 'Image' })

const isAutoHeight = ({ width, height }) => !!width && 'auto' === height

const Image = ({ style = {}, source, ...props }) => {
  const [mountedState, onMount] = useMountedState()
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
    const onImageSize = (width, height) => {
      // check is component still mounted
      if (!mountedState.current) {
        return
      }

      setAspectRatio(width / height)
    }

    const onImageError = e => log.error('Get image size error', e?.message, e, { uri })

    if (!uri || fixed) {
      return
    }

    // await first mount
    onMount(() => NativeImage.getSize(uri, onImageSize, onImageError))
  }, [uri, fixed, onMount])

  if (!aspectRatio && !fixed) {
    return null
  }

  return <NativeImage {...props} source={source} style={imageStyle} />
}

export default Image
