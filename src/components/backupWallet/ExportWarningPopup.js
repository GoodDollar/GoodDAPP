import React from 'react'
import { View } from 'react-native'
import { noop } from 'lodash'

import Icon from '../common/view/Icon'
import ExplanationDialog from '../common/dialogs/ExplanationDialog'

import { withStyles } from '../../lib/styles'

import { getDesignRelativeHeight } from '../../lib/utils/sizes'

const mapImageStylesToProps = ({ theme }) => ({
  imageWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  image: {
    color: theme.colors.primary,
  },
})

const WarningImage = withStyles(mapImageStylesToProps)(({ styles, ...imageProps }) => (
  <View style={styles.imageWrapper}>
    <Icon name="system-filled" size={100} style={styles.image} />
  </View>
))

const ExportWarningPopup = ({ styles, onDismiss = noop, ...dialogProps }) => (
  <ExplanationDialog
    {...dialogProps}
    title={`Do Not Send Tokens\nFrom Ethereum Network\nTo This Address`}
    text={`Keep in mind - This is an internal\nnetwork address for G$ tokens only.`}
    image={WarningImage}
    titleStyle={styles.title}
    textStyle={styles.text}
    containerStyle={styles.container}
    resizeMode={false}
    imageHeight={100}
    buttons={[
      {
        text: 'I UNDERSTAND',
        style: styles.button,
        action: onDismiss,
      },
    ]}
  />
)

const mapStylesToProps = ({ theme }) => ({
  container: {
    maxHeight: getDesignRelativeHeight(380, false),
  },
  title: {
    color: theme.colors.red,
    fontFamily: theme.fonts.slab,
    fontSize: 22,
    lineHeight: 29,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
})

export default withStyles(mapStylesToProps)(ExportWarningPopup)
