import React, { useCallback } from 'react'
import { TouchableOpacity } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { openLink } from '../../../lib/utils/linking'
import Config from '../../../config/config'

import InfoIcon from '../../../assets/info-icon.svg'

const GoodDollarPriceInfo = ({ theme }) => {
  const handleLearnMore = useCallback(() => openLink(Config.goodDollarPriceInfoUrl))
  return (
    <TouchableOpacity style={{ marginLeft: theme.sizes.default }} onPress={handleLearnMore}>
      <InfoIcon color={theme.colors.secondary} />
    </TouchableOpacity>
  )
}

export default withStyles()(GoodDollarPriceInfo)
