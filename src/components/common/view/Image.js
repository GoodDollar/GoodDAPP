import { first, noop } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import { Image as NativeImage, Platform, StyleSheet } from 'react-native'

import usePropsRefs from '../../../lib/hooks/usePropsRefs'

const getDimensions = Platform.select({
  web: ({ path, target }) => (Array.isArray(path) ? first(path) : target),
  native: ({ source }) => source,
})

const isAutoHeight = ({ width, height }) => !!width && 'auto' === height

const Image = ({ style = {}, onLoad = noop, ...props }) => {
  const [aspectRatio, setAspectRatio] = useState()
  const flattenStyle = useMemo(() => StyleSheet.flatten(style), [style])
  const refs = usePropsRefs([flattenStyle, onLoad])

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

  const onImageLoaded = useCallback(
    event => {
      const [getStyle, onLoad] = refs

      if (isAutoHeight(getStyle())) {
        const dimensions = getDimensions(event.nativeEvent)

        if (dimensions) {
          setAspectRatio(dimensions.width / dimensions.height)
        }
      }

      onLoad(event)
    },
    [setAspectRatio, refs],
  )

  return <NativeImage {...props} style={imageStyle} onLoad={onImageLoaded} />
}

export default Image
