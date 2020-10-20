import React from 'react'
import { noop } from 'lodash'

import Icon from '../common/view/Icon'
import ExplanationDialog from '../common/dialogs/ExplanationDialog'

import { withStyles } from '../../lib/styles'

//import { getDesignRelativeHeight } from '../../lib/utils/sizes'

const WarningImage = () => <Icon name="system" size={100} />

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
    resizeMode={false}
    imageHeight={100}
    buttons={[
      {
        text: 'I UNDERSTAND',
        action: noop,
      },
    ]}
  />
)

const mapStylesToProps = ({ theme }) => ({
  title: {
    color: theme.colors.red,
    fontFamily: theme.fonts.slab,
    fontSize: 22,
    lineHeight: 22,
  },
  text: {
    fontSize: 16,
  },
  imageStyle: {},
  container: {
    // minHeight: getDesignRelativeHeight(495),
  },
})

export default withStyles(mapStylesToProps)(ExportWarningPopup)
