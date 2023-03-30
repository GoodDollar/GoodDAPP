//@flow
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Appbar } from 'react-native-paper'

import { Icon, IconButton, Text } from '../../components/common'

import useOnPress from '../../lib/hooks/useOnPress'
import useSideMenu from '../../lib/hooks/useSideMenu'
import { isMobileNative } from '../../lib/utils/platform'
import { useSwitchNetwork } from '../../lib/wallet/GoodWalletProvider'
import { theme } from '../theme/styles'
import GreenCircle from '../../assets/ellipse46.svg'
import GoodWallet from '../../assets/goodwallet.svg'

// const showSupportFirst = !isEToro && !showInvite && !showRewards
// const defaultRightButtonStyles = [styles.marginRight10, styles.iconWidth]
// const supportButtonStyles = market ? defaultRightButtonStyles.slice(1) : defaultRightButtonStyless

const styles = {
  /*marketIconBackground: {
    backgroundColor: theme.colors.green,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: 'white',
    borderRadius: Platform.select({
      default: 150 / 2,
      web: '50%',
    }),
    paddingVertical: Platform.select({
      web: 20,
      default: 7,
    }),
    paddingHorizontal: 7,
    width: 80,
    height: 80,
    justifyContent: 'center',
  },*/
  marginLeft10: {
    marginLeft: 10,
  },
  marginRight10: {
    marginRight: 10,
  },
  iconWidth: {
    width: 37,
  },
  iconView: {
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  iconViewLeft: {
    alignItems: 'flex-start',
  },
  iconViewRight: {
    alignItems: 'flex-end',
  },
  appBar: { overflow: 'hidden', display: 'flex', justifyContent: 'space-between' },
  networkName: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  switchNetworkIcon: {
    marginLeft: theme.sizes.default,
  },
  activeIcon: {
    marginLeft: 4,
    marginRight: 4,
  },
  goodWalletLogo: {
    width: 100,
    marginLeft: -50,
  },
}

const iconStyle = isMobileNative ? styles.iconView : styles.iconWidth

const defaultRightButtonStyles = [iconStyle, styles.iconViewRight]

const NetworkName = () => {
  const { currentNetwork, switchNetwork } = useSwitchNetwork()

  const toggle = () => {
    switchNetwork(currentNetwork === 'FUSE' ? 'CELO' : 'FUSE')
  }

  return (
    <View style={styles.networkName}>
      <IconButton name="switch" onPress={toggle} color="transparent" circle={false} style={styles.switchNetworkIcon} />
      <View style={styles.activeIcon}>
        <GreenCircle />
      </View>
      <Text color={'white'} fontWeight="bold" fontSize={10}>
        {currentNetwork}
      </Text>
    </View>
  )
}
const TabsView = React.memo(
  ({ navigation }) => {
    const { slideToggle } = useSideMenu()

    const _slideToggle = useOnPress(slideToggle)

    return (
      <Appbar.Header dark style={styles.appBar}>
        <NetworkName />
        <View style={styles.goodWalletLogo}>
          <GoodWallet />
        </View>
        <TouchableOpacity onPress={_slideToggle} style={defaultRightButtonStyles}>
          <Icon name="hamburger_alt" size={20} color="white" style={styles.marginRight10} />
        </TouchableOpacity>
      </Appbar.Header>
    )
  },
  () => true,
)

export default TabsView
