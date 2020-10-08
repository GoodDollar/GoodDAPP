import React from 'react'
import { TouchableOpacity } from 'react-native'

import Icon from '../../../common/view/Icon'

import useGoodMarket from '../hooks/useGoodMarket'
import useOnPress from '../../../../lib/hooks/useOnPress'
import { useDialog } from '../../../../lib/undux/utils/dialog'

import { fireEvent, GOTO_MARKET_POPUP } from '../../../../lib/analytics/analytics'
import { withStyles } from '../../../../lib/styles'
import GoodMarketDialog from './GoodMarketDialog'

const GoodMarketButton = () => {
  const [showDialog] = useDialog()
  const { wasClicked, trackClicked, goToMarket } = useGoodMarket()

  const onPopupButtonClicked = useOnPress(() => {
    fireEvent(GOTO_MARKET_POPUP)
    goToMarket()
  }, [goToMarket])

  const onButtonClicked = useOnPress(() => {
    trackClicked()

    if (wasClicked) {
      goToMarket()
      return
    }

    showDialog({
      content: <GoodMarketDialog onGotoMarket={onPopupButtonClicked} />,
    })
  }, [wasClicked, trackClicked, onPopupButtonClicked])

  return (
    <TouchableOpacity onPress={onButtonClicked}>
      <Icon name="goodmarket" size={36} color="white" />
    </TouchableOpacity>
  )
}

const getStylesFromProps = ({ theme }) => ({})

export default withStyles(getStylesFromProps)(GoodMarketButton)
