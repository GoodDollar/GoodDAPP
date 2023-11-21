// @flow

// libraries
import React, { useCallback, useMemo } from 'react'
import { ScrollView } from 'react-native'
import { get } from 'lodash'

// components
import { t } from '@lingui/macro'
import Wrapper from '../common/layout/Wrapper'
import { Section } from '../common'
import BorderedBox from '../common/view/BorderedBox'
import NavBar from '../appNavigation/NavBar'

// utils
import { withStyles } from '../../lib/styles'
import { useWallet } from '../../lib/wallet/GoodWalletProvider'
import config from '../../config/config'
import { getNetworkName } from '../../lib/constants/network'

// assets
import Checkmark from '../../assets/checkmark.svg'
import { useDialog } from '../../lib/dialog/useDialog'
import ExportWarningPopup from './ExportWarningPopup'

// localization

type ExportWalletProps = {
  styles: {},
  theme: {},
  screenProps: any,
}

const checkmarkIconSize = 28

const Divider = ({ size = 50 }) => <Section.Separator color="transparent" width={size} style={{ zIndex: -10 }} />

// TODO: handle 3rd party wallet
const ExportWalletData = ({ navigation, styles, theme }: ExportWalletProps) => {
  const { navigate } = navigation
  const goodWallet = useWallet()
  const { showDialog, hideDialog } = useDialog()

  const handleGoHome = useCallback(() => navigate('Home'), [navigate])

  const [publicKey, fullPrivateKey, web3ProviderUrl, networkId] = useMemo(() => {
    const { account = '', networkId } = goodWallet

    return [
      account,
      get(goodWallet, 'wallet.eth.accounts.wallet[0].privateKey', ''),
      networkId && config.ethereum[networkId].defaultPublicRpc,
      networkId,
    ]
  }, [goodWallet])

  const label = getNetworkName(networkId)

  const onPrivateKeyCopy = useCallback(
    resultCallback => {
      const onCancel = () => resultCallback(false)

      const onConfirm = () => {
        hideDialog()
        resultCallback(true)
      }

      showDialog({
        showButtons: false,
        onDismiss: onCancel,
        content: <ExportWarningPopup onDismiss={onConfirm} />,
      })
    },
    [showDialog, hideDialog],
  )

  return (
    <Wrapper style={styles.wrapper}>
      <NavBar title="EXPORT MY WALLET" goBack={handleGoHome} />
      <ScrollView style={styles.container}>
        <Divider size={30} />
        <Section.Text fontSize={28} fontWeight="bold" fontFamily={theme.fonts.slab} color="black">
          {t`My account details`}
        </Section.Text>
        <Divider size={10} />
        <Section.Text fontSize={15} fontWeight="medium" fontFamily="Roboto" color="black">
          {t`All your information at a glance to easily import GoodDollar to MetaMask`}
        </Section.Text>
        <Divider size={30} />
        <BorderedBox
          styles={styles}
          theme={theme}
          title={t`My Wallet Address`}
          content={publicKey}
          imageSize={checkmarkIconSize}
          image={Checkmark}
          copyButtonText={t`Copy address`}
          showCopyIcon={false}
          truncateContent
          enableIndicateAction
          enableSideMode
        />
        <Divider />
        <BorderedBox
          styles={styles}
          theme={theme}
          title={t`My Private Key`}
          content={fullPrivateKey}
          imageSize={checkmarkIconSize}
          onBeforeCopy={onPrivateKeyCopy}
          image={Checkmark}
          copyButtonText={t`Copy Key`}
          showCopyIcon={false}
          enableIndicateAction
          truncateContent
          enableSideMode
        />
        <Divider />
        <BorderedBox
          styles={styles}
          theme={theme}
          title={t`${label} RPC Address`}
          content={web3ProviderUrl}
          imageSize={checkmarkIconSize}
          image={Checkmark}
          copyButtonText={t`Copy RPC`}
          showCopyIcon={false}
          enableIndicateAction
          enableSideMode
        />
        <Divider />
        <BorderedBox
          styles={styles}
          theme={theme}
          title="Chain ID"
          content={String(networkId)}
          imageSize={checkmarkIconSize}
          image={Checkmark}
          copyButtonText="Copy Chain ID"
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
