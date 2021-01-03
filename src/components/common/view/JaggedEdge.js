// @flow
import React, { useMemo, useState } from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeWidth } from '../../../lib/utils/sizes'

const useJaggedEdge = (width, tileSize, styles) =>
  useMemo(() => {
    const calcTiles = width / tileSize
    const tiles = Math.ceil(calcTiles) // amount of triangles

    const leftOffset = ((tiles - calcTiles) * tileSize) / 2 // offset for aligning tiles to the left
    const margin = (-tileSize * 1.5) / 2 // negative margin for vertical alignment

    // Create array of tiles (triangles)
    const tileItems = Array.from({ length: tiles }, (e, i) => {
      const marginLeft = i === 0 ? leftOffset : 0
      return <View key={`tile-${i}`} style={[styles.tile, { marginLeft }]} />
    })

    return { leftOffset, margin, tileItems }
  }, [width, tileSize, styles])

const JaggedEdge = ({ styles, theme }) => {
  const [width, setWidth] = useState(0)

  // calculate container's width
  const onLayout = ({ nativeEvent }) => setWidth(nativeEvent.layout.width)

  // size of the triangles
  const tileSize = getDesignRelativeWidth(theme.modals.jaggedEdgeSize)

  const { leftOffset, margin, tileItems } = useJaggedEdge(width, tileSize, styles)

  return (
    <View onLayout={onLayout} style={[{ marginTop: margin }, styles.container]}>
      {tileItems}
      <View style={[styles.end, { marginLeft: -leftOffset }]} />
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  const size = getDesignRelativeWidth(theme.modals.jaggedEdgeSize)

  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      width: '100%',
    },
    tile: {
      width: size,
      height: size,
      backgroundColor: theme.modals.backgroundColor,
      transform: [{ rotate: '45deg' }],
    },
    end: {
      width: size,
      height: size * 1.5, // height is the tile's diagonal
    },
  }
}

export default withStyles(getStylesFromProps)(JaggedEdge)
