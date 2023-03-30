import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import Icon from '../../../common/view/Icon'
import useActionLinks from '../hooks/useActionLinks'
import useOnPress from '../../../../lib/hooks/useOnPress'

// import { useDialog } from '../../../../lib/dialog/useDialog'
// import { fireEvent, GOTO_MARKET_POPUP } from '../../../../lib/analytics/analytics'
import { withStyles } from '../../../../lib/styles'
import { isIOSNative } from '../../../../lib/utils/platform'

// import GoodMarketDialog from './GoodMarketDialog'

const GoodActionBar = ({ styles }) => {
  // const { showDialog } = useDialog()

  // const { wasClicked, trackClicked, goToMarket } = useGoodMarket()
  const { wasClicked, trackClicked, goToExternal } = useActionLinks()

  // const onPopupButtonClicked = useCallback(() => {
  //   fireEvent(GOTO_MARKET_POPUP)
  //   goToExternal()
  // }, [goToExternal])

  const onButtonClicked = useOnPress(
    e => {
      const src = e.target.dataset.testid

      // if (wasClicked) {
      goToExternal(src)
      return

      // }
      //todo: Awaiting confirmation from designer, either remove or keep and refactor to align with the action item clicked
      // showDialog({
      //   isMinHeight: false,
      //   showButtons: false,
      //   onDismiss: noop,
      //   content: <GoodMarketDialog onGotoMarket={onPopupButtonClicked} />,
      // })
    },
    [wasClicked, trackClicked],
  )

  return (
    <>
      <View style={styles.actionBar}>
        <TouchableOpacity onPress={onButtonClicked} style={styles.actionItem}>
          <Icon name="learn" testID="learn" size={48} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onButtonClicked} style={styles.actionItem}>
          <Icon name="usegd" testID="useGd" size={48} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onButtonClicked} style={styles.actionItem}>
          <Icon name="donate" testID="donate" size={48} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onButtonClicked} style={styles.actionItem}>
          <Icon name="rewards-alt" size={48} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onButtonClicked} style={styles.actionItem}>
          <Icon name="vote" testID="vote" size={48} color="white" />
        </TouchableOpacity>
      </View>
    </>
  )
}

const getStylesFromProps = ({ theme }) => ({
  actionBar: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: theme.sizes.default,
    paddingBottom: isIOSNative ? theme.sizes.defaultDouble : theme.sizes.default,
    borderTopRightRadius: 22,
    borderTopLeftRadius: 22,
  },
  actionItem: {
    marginLeft: 10,
    marginRight: 10,
  },
})

export default withStyles(getStylesFromProps)(GoodActionBar)
