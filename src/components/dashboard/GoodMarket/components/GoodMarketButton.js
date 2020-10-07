import React, { useEffect, useRef } from 'react'
import { TouchableOpacity } from 'react-native'

import Icon from '../../../common/view/Icon'
import useGoodMarket from '../hooks/useGoodMarket'

import useOnPress from '../../../../lib/hooks/useOnPress'
import { useDialog } from '../../../../lib/undux/utils/dialog'
import { withStyles } from '../../../../lib/styles'
import GoodMarketDialog from './GoodMarketDialog'

const GoodMarketButton = () => {
  const [showDialog] = useDialog()
  const showPopupOnNextRenderRef = useRef(false)

  const { wasClicked, trackClicked, goToMarket } = useGoodMarket()

  const onButtonClicked = useOnPress(() => {
    if (wasClicked) {
      goToMarket()
    } else {
      showPopupOnNextRenderRef.current = true
    }

    trackClicked()
  }, [wasClicked, trackClicked, goToMarket])

  useEffect(() => {
    if (!showPopupOnNextRenderRef.current) {
      return
    }

    const onLetsGoClicked = () => {
      goToMarket()
      trackClicked()
    }

    showPopupOnNextRenderRef.current = false

    showDialog({
      content: <GoodMarketDialog onGotoMarket={onLetsGoClicked} />,
    })
  }, [goToMarket, trackClicked])

  return (
    <TouchableOpacity onPress={onButtonClicked}>
      <Icon name="goodmarket" size={36} color="white" />
    </TouchableOpacity>
  )
}

const getStylesFromProps = ({ theme }) => ({})

export default withStyles(getStylesFromProps)(GoodMarketButton)
