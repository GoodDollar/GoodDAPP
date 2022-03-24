import React from 'react'
import { noop } from 'lodash'

import { t } from '@lingui/macro'
import ExplanationDialog from '../common/dialogs/ExplanationDialog'

import { withStyles } from '../../lib/styles'

import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { InfoIcon } from '../common/modal/InfoIcon'

const ExportWarningPopup = ({ styles, onDismiss = noop, ...dialogProps }) => (
  <ExplanationDialog
    {...dialogProps}
    title={t`Do Not Send Tokens\nFrom Ethereum Network\nTo This Address`}
    text={t`Keep in mind - This is an internal\nnetwork address for G$ tokens only.`}
    image={InfoIcon}
    titleStyle={styles.title}
    textStyle={styles.text}
    containerStyle={styles.container}
    resizeMode={false}
    imageHeight={100}
    buttons={[
      {
        text: t`I UNDERSTAND`,
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
