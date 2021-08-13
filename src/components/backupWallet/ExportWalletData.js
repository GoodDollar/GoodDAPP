// @flow

// libraries
import React, { useCallback, useMemo } from 'react'
import { ScrollView } from 'react-native'
import { get, noop } from 'lodash'

// components
import Wrapper from '../common/layout/Wrapper'
import { Section } from '../common'
import BorderedBox from '../common/view/BorderedBox'
import NavBar from '../appNavigation/NavBar'

// hooks
import { useDialog } from '../../lib/undux/utils/dialog'

// utils
import { withStyles } from '../../lib/styles'
import goodWallet from '../../lib/wallet/GoodWallet'
import config from '../../config/config'

// assets
import Checkmark from '../../assets/checkmark.svg'
import ExportWarningPopup from './ExportWarningPopup'

type ExportWalletProps = {
  styles: {},
  theme: {},
  screenProps: any,
}

const checkmarkIconSize = 28

const Divider = ({ size = 50 }) => <Section.Separator color="transparent" width={size} style={{ zIndex: -10 }} />

const ExportWalletData = ({ navigation, styles, theme }: ExportWalletProps) => {
  const { navigate } = navigation
  const [showDialog] = useDialog()

  const handleGoHome = useCallback(() => navigate('Home'), [navigate])

  const [publicKey, fullPrivateKey, web3ProviderUrl, networkId] = useMemo(() => {
    const { account = '', networkId } = goodWallet

    return [
      account,
      get(goodWallet, 'wallet.eth.accounts.wallet[0].privateKey', ''),
      networkId && config.ethereum[networkId].httpWeb3provider,
      networkId,
    ]
  }, [])

  const onPublicKeyCopied = useCallback(
    () =>
      showDialog({
        showButtons: false,
        onDismiss: noop,
        content: <ExportWarningPopup onDismiss={noop} />,
      }),
    [showDialog],
  )

  return (
    <Wrapper style={styles.wrapper}>
      <NavBar title="EXPORT MY WALLET" goBack={handleGoHome} />
      <ScrollView style={styles.container}>
        <Divider size={30} />
        <Section.Text fontSize={28} fontWeight="bold" fontFamily="Roboto Slab" color="black">
          My account details
        </Section.Text>
        <Divider size={10} />
        <Section.Text fontSize={15} fontWeight="medium" fontFamily="Roboto" color="black">
          All your information at a glance to easily import GoodDollar to MetaMask
        </Section.Text>
        <Divider size={30} />
        <BorderedBox
          styles={styles}
          theme={theme}
          title="My Private Key"
          content={fullPrivateKey}
          imageSize={checkmarkIconSize}
          image={Checkmark}
          copyButtonText="Copy Key"
          showCopyIcon={false}
          enableIndicateAction
          truncateContent
          enableSideMode
        />
        <Divider />
        <BorderedBox
          styles={styles}
          theme={theme}
          title="My Wallet Address"
          content={publicKey}
          imageSize={checkmarkIconSize}
          image={Checkmark}
          copyButtonText="Copy address"
          showCopyIcon={false}
          onCopied={onPublicKeyCopied}
          truncateContent
          enableIndicateAction
          enableSideMode
        />
        <Divider />
        <BorderedBox
          styles={styles}
          theme={theme}
          title="Fuse Network RPC Address"
          content={web3ProviderUrl}
          imageSize={checkmarkIconSize}
          image={Checkmark}
          copyButtonText="Copy RPC"
          showCopyIcon={false}
          enableIndicateAction
          enableSideMode
        />
        <Divider />
        <BorderedBox
          styles={styles}
          theme={theme}
          title="Fuse ID Chain"
          content={String(networkId)}
          imageSize={checkmarkIconSize}
          image={Checkmark}
          copyButtonText="Copy ID Chain"
          showCopyIcon={false}
          enableIndicateAction
          enableSideMode
        />
        <Divider />
      </ScrollView>
    </Wrapper>
  )
}

const styles = ({ theme }) => ({
  wrapper: {
    flex: 1,
    padding: 0,
  },
  container: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: '5%',
  },
})

export default withStyles(styles)(ExportWalletData)
