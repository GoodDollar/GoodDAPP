import React from 'react'
import { View } from 'react-native'
import { noop } from 'lodash'

import Icon from '../common/view/Icon'
import ExplanationDialog from '../common/dialogs/ExplanationDialog'

import { withStyles } from '../../lib/styles'

//import { getDesignRelativeHeight } from '../../lib/utils/sizes'

const mapImageStylesToProps = ({ theme }) => ({
  imageWrapper: {},
  image: {},
})

const WarningImage = withStyles(mapImageStylesToProps)(({ styles, style, ...imageProps }) => (
  <View style={[style, styles.imageWrapper]}>
    <Icon name="system" size={100} style={styles.image} />
  </View>
))

const ExportWarningPopup = ({ styles, ...dialogProps }) => (
  <ExplanationDialog
    {...dialogProps}
    title={`Do Not Send Tokens\nFrom Ethereum Network\nTo This Address`}
    text={`Keep in mind - This is an internal\nNetwork address for G$ tokens only.`}
    image={WarningImage}
    titleStyle={styles.title}
    textStyle={styles.text}
    containerStyle={styles.container}
    imageStyle={styles.imageStyle}
    buttonsContainerStyle={styles.buttonContainer}
    resizeMode={false}
    imageHeight={100}
    buttons={[
      {
        text: 'I UNDERSTAND',
        style: styles.button,
        action: noop,
      },
    ]}
  />
)

const mapStylesToProps = ({ theme }) => ({
  container: {
    // minHeight: getDesignRelativeHeight(495),
  },
  title: {
    color: theme.colors.red,
    fontFamily: theme.fonts.slab,
    fontSize: 22,
    lineHeight: 22,
  },
  text: {
    fontSize: 16,
  },
  buttonContainer: {},
  button: {},
})

export default withStyles(mapStylesToProps)(ExportWarningPopup)
