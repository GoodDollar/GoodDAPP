// @flow

// libraries
import React, { useCallback, useMemo } from 'react'
import { Image, Platform, View } from 'react-native'
import { get } from 'lodash'

// components
import Wrapper from '../common/layout/Wrapper'
import { Section } from '../common'
import BorderedBox from '../common/view/BorderedBox'
import NavBar from '../appNavigation/NavBar'

// hooks
import { useDialog } from '../../lib/undux/utils/dialog'
import useLoading from '../../lib/hooks/useLoadingIndicator'

// utils
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import GoodWallet from '../../lib/wallet/GoodWallet'
import GDStore from '../../lib/undux/GDStore'
import config from '../../config/config'

// assets
import unknownProfile from '../../assets/unknownProfile.svg'
import FuseLogo from '../../assets/ExportWallet/FuseLogo.svg'
import ExportWarningPopup from './ExportWarningPopup'

if (Platform.OS === 'web') {
  Image.prefetch(unknownProfile)
  Image.prefetch(FuseLogo)
}

const rpcImageSource = { uri: FuseLogo }
const { account = '', networkId } = GoodWallet
const web3ProviderUrl = networkId && config.ethereum[networkId].httpWeb3provider

type ExportWalletProps = {
  styles: {},
  theme: {},
  screenProps: any,
}

const ExportWalletData = ({ navigation, styles, theme }: ExportWalletProps) => {
  const { navigate } = navigation
  const [showDialog] = useDialog()
  const gdstore = GDStore.useStore()
  const { avatar } = gdstore.get('profile')
  const [showLoading, hideLoading] = useLoading()
  const handleGoHome = useCallback(() => navigate('Home'), [navigate])
  const avatarSource = useMemo(() => (avatar ? { uri: avatar } : unknownProfile), [avatar])

  // getting the privateKey of GD wallet address - which index is 0
  const fullPrivateKey = useMemo(() => get(GoodWallet, 'wallet.eth.accounts.wallet[0].privateKey', ''), [])

  const onPublicKeyCopied = useCallback(() => {
    showLoading()

    showDialog({
      showButtons: false,
      onDismiss: hideLoading,
      content: <ExportWarningPopup onDismiss={hideLoading} />,
    })
  }, [showDialog])

  return (
    <Wrapper style={styles.wrapper}>
      <NavBar title="EXPORT MY WALLET" goBack={handleGoHome} />
      <Section grow>
        <View style={styles.containerForBoxes}>
          <BorderedBox
            styles={styles}
            theme={theme}
            title="My Private Key"
            content={fullPrivateKey}
            truncateContent
            imageSize={50}
            imageSource={avatarSource}
            copyButtonText="Copy Key"
            showCopyIcon={false}
          />
          <BorderedBox
            styles={styles}
            theme={theme}
            title="My Wallet Address"
            content={account}
            truncateContent
            imageSize={50}
            imageSource={avatarSource}
            copyButtonText="Copy address"
            showCopyIcon={false}
            onCopied={onPublicKeyCopied}
          />
          <BorderedBox
            styles={styles}
            theme={theme}
            title="Fuse Network RPC Address"
            content={web3ProviderUrl}
            imageSize={50}
            imageSource={rpcImageSource}
            copyButtonText="Copy RPC"
            showCopyIcon={false}
          />
        </View>
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
