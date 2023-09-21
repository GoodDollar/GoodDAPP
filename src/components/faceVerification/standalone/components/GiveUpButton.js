import { t } from '@lingui/macro'
import React from 'react'

import { withStyles } from '../../../../lib/styles'
import { CustomButton } from '../../../common'
import useGiveUpDialog from '../hooks/useGiveUpDialog'

const GiveUpButton = navigation => {
  const { onGiveUp } = useGiveUpDialog(navigation, 'failed')

  return <CustomButton style={{ marginTop: 8 }} onPress={onGiveUp}>{t`I give up`}</CustomButton>
}

const getStylesFromProps = ({ theme }) => ({})

export default withStyles(getStylesFromProps)(GiveUpButton)
