import React, { useCallback } from 'react'
import { TouchableOpacity } from 'react-native'

import useGoodMarket from '../hooks/useGoodMarket'

import Icon from '../../../common/view/Icon'
import { useDialog } from '../../../../lib/undux/utils/dialog'
import { withStyles } from '../../../../lib/styles'
import GoodMarketDialog from './GoodMarketDialog'

const GoodMarketButton = () => {
  const [showDialog] = useDialog()
  const [wasOpened, goToMarket] = useGoodMarket()

  const onMarketButtonClicked = useCallback(() => {
    if (wasOpened) {
      goToMarket()
      return
    }

    showDialog({
      content: <GoodMarketDialog onGotoMarket={goToMarket} />,
    })
  }, [wasOpened, goToMarket])

  return (
    <TouchableOpacity onPress={onMarketButtonClicked}>
      <Icon name="goodmarket" size={36} color="white" />
    </TouchableOpacity>
  )
}

const getStylesFromProps = ({ theme }) => ({})

export default withStyles(getStylesFromProps)(GoodMarketButton)
