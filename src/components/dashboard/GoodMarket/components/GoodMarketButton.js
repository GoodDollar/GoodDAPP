import React, { useCallback, useEffect } from 'react'
import { Animated, TouchableOpacity } from 'react-native'
import { noop } from 'lodash'

import Icon from '../../../common/view/Icon'

import useGoodMarket from '../hooks/useGoodMarket'
import useOnPress from '../../../../lib/hooks/useOnPress'
import { useDialog } from '../../../../lib/undux/utils/dialog'

import { fireEvent, GOTO_MARKET_POPUP } from '../../../../lib/analytics/analytics'
import { withStyles } from '../../../../lib/styles'
import { getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import GoodMarketDialog from './GoodMarketDialog'

const GoodMarketButton = ({ styles }) => {
  const [showDialog] = useDialog()
  const { wasClicked, trackClicked, goToMarket } = useGoodMarket()

  const onPopupButtonClicked = useCallback(() => {
    fireEvent(GOTO_MARKET_POPUP)
    goToMarket()
  }, [goToMarket])

  useEffect(() => {
    const slideAnim = new Animated.Value(-100)

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 3000,
    }).start()
  }, []) // just on mount

  const onButtonClicked = useOnPress(() => {
    trackClicked()

    if (wasClicked) {
      goToMarket()
      return
    }

    showDialog({
      isMinHeight: false,
      showButtons: false,
      onDismiss: noop,
      content: <GoodMarketDialog onGotoMarket={onPopupButtonClicked} />,
    })
  }, [wasClicked, trackClicked, onPopupButtonClicked])

  return (
    <TouchableOpacity onPress={onButtonClicked} style={styles.marketButton}>
      <Icon name="goodmarket" size={36} color="white" />
    </TouchableOpacity>
  )
}

const getStylesFromProps = ({ theme }) => ({
  marketButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    width: getDesignRelativeWidth(140),
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 0,
    marginHorizontal: 'auto',
    borderTopRightRadius: 22,
    borderTopLeftRadius: 22,
  },
})

export default withStyles(getStylesFromProps)(GoodMarketButton)
