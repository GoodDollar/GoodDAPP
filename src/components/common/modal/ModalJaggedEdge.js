// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { mediumZIndex } from './styles'

const ModalJaggedEdge = ({ styles, style }: any) => <View style={[styles.jaggedEdge, style]} />

const getStylesFromProps = ({ theme }) => ({
  jaggedEdge: {
    backgroundImage: `linear-gradient(40deg, transparent 75%, ${theme.modals.backgroundColor} 76%), linear-gradient(-40deg, transparent 75%, ${theme.modals.backgroundColor} 76%)`,
    backgroundPosition: `-${theme.modals.jaggedEdgeSize / 2}px 0`,
    backgroundRepeat: 'repeat-x',
    backgroundSize: `${theme.modals.jaggedEdgeSize}px ${theme.modals.jaggedEdgeSize}px`,
    height: theme.modals.jaggedEdgeSize,
    position: 'relative',
    width: '100%',
    zIndex: mediumZIndex,
  },
})

export default withStyles(getStylesFromProps)(ModalJaggedEdge)
