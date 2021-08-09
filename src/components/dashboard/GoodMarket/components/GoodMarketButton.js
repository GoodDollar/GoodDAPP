import React, { useCallback, useEffect, useRef } from 'react'
import { Animated, Easing, Platform, TouchableOpacity } from 'react-native'
import { noop } from 'lodash'

import Icon from '../../../common/view/Icon'

import useGoodMarket from '../hooks/useGoodMarket'
import useOnPress from '../../../../lib/hooks/useOnPress'
import { useDialog } from '../../../../lib/undux/utils/dialog'

import { fireEvent, GOTO_MARKET_POPUP } from '../../../../lib/analytics/analytics'
import { withStyles } from '../../../../lib/styles'
import { getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import { isIOSNative } from '../../../../lib/utils/platform'
import GoodMarketDialog from './GoodMarketDialog'

export const marketAnimationDuration = 1500

const GoodMarketButton = ({ styles }) => {
  const [showDialog] = useDialog()
  const slideAnim = useRef(new Animated.Value(-60)).current
  const { wasClicked, trackClicked, goToMarket } = useGoodMarket()

  const onPopupButtonClicked = useCallback(() => {
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
      isMinHeight: false,
      showButtons: false,
      onDismiss: noop,
      content: <GoodMarketDialog onGotoMarket={onPopupButtonClicked} />,
    })
  }, [wasClicked, trackClicked, onPopupButtonClicked])

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: marketAnimationDuration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <>
      <Animated.View style={[styles.btnContainer, { bottom: slideAnim }]}>
        <TouchableOpacity onPress={onButtonClicked} style={styles.marketButton}>
          <Icon name="goodmarket" size={36} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </>
  )
}

const getStylesFromProps = ({ theme }) => ({
  btnContainer: {
    alignItems: 'center',
    ...Platform.select({
      web: {
        position: 'absolute',
        right: '50%',
        left: '50%',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        zIndex: 0,
      },
      default: { position: 'absolute', width: '100%' },
    }),
  },
  marketButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: theme.sizes.default,
    paddingBottom: isIOSNative ? theme.sizes.defaultDouble : theme.sizes.default,
    width: getDesignRelativeWidth(140),
    borderTopRightRadius: 22,
    borderTopLeftRadius: 22,
  },
})

export default withStyles(getStylesFromProps)(GoodMarketButton)
