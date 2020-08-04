// @flow

// libraries
import React, { useMemo } from 'react'
import { View } from 'react-native'
import { get } from 'lodash'

// components
import Wrapper from '../common/layout/Wrapper'
import { CustomButton, Section } from '../common'
import BorderedBox from '../common/view/BorderedBox'
import NavBar from '../appNavigation/NavBar'

// hooks
import useOnPress from '../../lib/hooks/useOnPress'

// utils
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import GoodWallet from '../../lib/wallet/GoodWallet'
import GDStore from '../../lib/undux/GDStore'
import config from '../../config/config'

// assets
import unknownProfile from '../../assets/unknownProfile.svg'
import FuseLogo from '../../assets/ExportWallet/FuseLogo.svg'

const web3ProviderUrl = GoodWallet.networkId && config.ethereum[GoodWallet.networkId].httpWeb3provider

type ExportWalletProps = {
  styles: {},
  theme: {},
  screenProps: any,
}

const ExportWalletData = ({ navigation, styles, theme }: ExportWalletProps) => {
  const { navigate } = navigation
  const gdstore = GDStore.useStore()
  const { avatar } = gdstore.get('profile')

  const avatarSource = useMemo(() => (avatar ? avatar : unknownProfile), [avatar])

  // getting the privateKey of GD wallet address - which index is 0
  const fullPrivateKey = get(GoodWallet, 'wallet.eth.accounts.wallet[0].privateKey', '')
  const handleGoHome = useOnPress(() => navigate('Home'), [navigate])

  return (
    <Wrapper style={styles.wrapper}>
      <NavBar title="EXPORT MY WALLET" goBack={handleGoHome} />
      <Section grow>
        <View style={styles.containerForBoxes}>
          <BorderedBox
            styles={styles}
            theme={theme}
            title="My Wallet Private Key"
            content={fullPrivateKey}
            truncateContent
            imageSource={avatarSource}
            copyButtonText="Copy Key"
          />
          <BorderedBox
            styles={styles}
            theme={theme}
            title="Fuse Network RPC Address"
            content={web3ProviderUrl}
            imageSource={FuseLogo}
            copyButtonText="Copy Address"
          />
        </View>
        <CustomButton onPress={handleGoHome}>Done</CustomButton>
      </Section>
    </Wrapper>
  )
}

const styles = ({ theme }) => ({
  wrapper: {
    backgroundImage: 'none',
    backgroundColor: 'none',
    padding: 0,
  },
  containerForBoxes: {
    display: 'flex',
    justifyContent: 'space-around',
    flexGrow: 1,
    marginBottom: getDesignRelativeHeight(10, false),
  },
})

export default withStyles(styles)(ExportWalletData)
