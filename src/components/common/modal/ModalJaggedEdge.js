// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { mediumZIndex } from './styles'

const ModalJaggedEdge = (props: any) => {
  const { styles, style } = props

  return <View style={[styles.jaggedEdge, style]} />
}

const getStylesFromProps = ({ theme }) => {
  return {
    jaggedEdge: {
      backgroundImage: `linear-gradient(45deg, transparent 75%, ${
        theme.modals.backgroundColor
      } 76%), linear-gradient(-45deg, transparent 75%, ${theme.modals.backgroundColor} 76%)`,
      backgroundPosition: '0 0',
      backgroundRepeat: 'repeat-x',
      backgroundSize: `${theme.modals.jaggedEdgeSize}px`,
      height: theme.modals.jaggedEdgeSize,
      position: 'relative',
      width: '100%',
      zIndex: mediumZIndex,
    },
  }
}

export default withStyles(getStylesFromProps)(ModalJaggedEdge)
