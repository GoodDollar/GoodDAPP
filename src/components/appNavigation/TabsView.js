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

const styles = {
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
  switchButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
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
      <TouchableOpacity onPress={toggle} style={styles.switchButton}>
        <IconButton
          onPress={toggle}
          name="switch"
          bgColor="transparent"
          color="white"
          circle={false}
          style={styles.switchNetworkIcon}
        />
        <View style={styles.activeIcon}>
          <GreenCircle />
        </View>
        <Text color={'white'} fontWeight="bold" fontSize={10}>
          {currentNetwork}
        </Text>
      </TouchableOpacity>
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
