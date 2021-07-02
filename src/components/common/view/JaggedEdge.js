// @flow
import React, { useMemo, useState } from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'

// To match web version
const TILES = 27

const useJaggedEdge = (width, tileSize, styles) =>
  useMemo(() => {
    const tileDiagonal = Math.sqrt(2) * tileSize

    const marginLeft = tileDiagonal - tileSize
    const marginTop = -tileDiagonal / 2 // negative margin for vertical alignment

    // Create array of tiles (triangles)
    const tileItems = Array.from({ length: TILES }, (e, i) => {
      const leftMargin = i === 0 ? marginLeft / 2 : marginLeft
      return (
        <View key={`tile-${i}`} style={[styles.tile, { width: tileSize, height: tileSize, marginLeft: leftMargin }]} />
      )
    })

    return { marginTop, tileItems, tileDiagonal }
  }, [width, tileSize, styles])

const JaggedEdge = ({ styles, theme }) => {
  const [width, setWidth] = useState(0)

  // calculate container's width
  const onLayout = ({ nativeEvent }) => setWidth(nativeEvent.layout.width)

  // size of the triangles
  const tileSize = useMemo(() => width / ((TILES - 0.5) * Math.sqrt(2)), [width])

  const { marginTop, tileItems, tileDiagonal } = useJaggedEdge(width, tileSize, styles)

  return (
    <View onLayout={onLayout} style={[{ marginTop, height: tileDiagonal }, styles.container]}>
      {tileItems}
    </View>
  )
}

const getStylesFromProps = ({ theme }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  tile: {
    backgroundColor: theme.modals.backgroundColor,
    transform: [{ rotate: '45deg' }],
  },
})

export default withStyles(getStylesFromProps)(JaggedEdge)
