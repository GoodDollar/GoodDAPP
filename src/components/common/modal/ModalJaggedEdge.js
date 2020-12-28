// @flow
import React from 'react'
import { Platform, View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { isMobileNative } from '../../../lib/utils/platform'
import JaggedEdge from '../view/JaggedEdge'
import { mediumZIndex } from './styles'

const ModalJaggedEdge = ({ styles, style }: any) => (
  <View style={[styles.jaggedEdge, style]}>{isMobileNative && <JaggedEdge />}</View>
)

const getStylesFromProps = ({ theme }) => ({
  jaggedEdge: {
    ...Platform.select({
      web: {
        backgroundImage: `linear-gradient(40deg, transparent 75%, ${
          theme.modals.backgroundColor
        } 76%), linear-gradient(-40deg, transparent 75%, ${theme.modals.backgroundColor} 76%)`,
        backgroundPosition: `-${theme.modals.jaggedEdgeSize / 2}px 0`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: `${theme.modals.jaggedEdgeSize}px ${theme.modals.jaggedEdgeSize}px`,
      },
      default: {
        elevation: 24,
      },
    }),
    height: theme.modals.jaggedEdgeSize,
    position: 'relative',
    width: '100%',
    zIndex: mediumZIndex,
  },
})

export default withStyles(getStylesFromProps)(ModalJaggedEdge)
