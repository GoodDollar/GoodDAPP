// @flow
import React, { useCallback, useMemo } from 'react'
import { Share, View } from 'react-native'
import useNativeSharing from '../../lib/hooks/useNativeSharing'
import { fireEvent } from '../../lib/analytics/analytics'
import GDStore from '../../lib/undux/GDStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import goodWallet from '../../lib/wallet/GoodWallet'
import { PushButton } from '../appNavigation/PushButton'
import { CopyButton, CustomButton, QRCode, ScanQRButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { withStyles } from '../../lib/styles'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const SHARE_TEXT = 'Share your wallet link'

const Receive = ({ screenProps, styles }: ReceiveProps) => {
  const profile = GDStore.useStore().get('profile')
  const { account, networkId } = goodWallet
  const [showErrorDialog] = useErrorDialog()
  const { canShare, generateCode, generateReceiveShareObject, generateShareLink } = useNativeSharing()
  const amount = 0
  const reason = ''
  const codeObj = useMemo(() => generateCode(account, networkId, amount, reason), [account, networkId, amount, reason])
  const share = useMemo(() => generateReceiveShareObject(codeObj, amount, '', profile.fullName), [codeObj])
  const shareLink = useMemo(() => generateShareLink('receive', codeObj), [codeObj])

  const shareAction = useCallback(async () => {
    try {
      fireEvent('RECEIVE_DONE', { type: 'wallet' })
      await Share.share(share)
    } catch (e) {
      if (e.name !== 'AbortError') {
        showErrorDialog(e)
      }
    }
  }, [showErrorDialog, share])

  const onPressScanQRButton = useCallback(() => screenProps.push('ReceiveByQR'), [screenProps])

  const onPressCopyButton = () => fireEvent('RECEIVE_DONE', { type: 'wallet' })

  return (
    <Wrapper>
      <TopBar hideBalance={false} push={screenProps.push}>
        <ScanQRButton onPress={onPressScanQRButton} />
      </TopBar>
      <Section grow>
        <Section.Stack grow={3} justifyContent="space-around" alignItems="center">
          <Section.Text fontSize={14} style={styles.mainText}>
            Let someone scan your wallet address
          </Section.Text>
          <QRCode value={shareLink} />
        </Section.Stack>
        <Section.Stack grow={1} justifyContent="center" alignItems="center">
          <Section.Text fontSize={14}>- OR -</Section.Text>
        </Section.Stack>
        <Section.Stack alignItems="stretch">
          <PushButton
            dark={false}
            routeName="Who"
            mode="outlined"
            screenProps={screenProps}
            params={{ nextRoutes: ['Amount', 'Reason', 'ReceiveSummary'], params: { action: 'Receive' } }}
          >
            Request specific amount
          </PushButton>
          <View style={styles.space} />
          {canShare ? (
            <CustomButton onPress={shareAction}>{SHARE_TEXT}</CustomButton>
          ) : (
            <CopyButton
              style={styles.shareButton}
              toCopy={shareLink}
              onPress={onPressCopyButton}
              onPressDone={screenProps.goToRoot}
            >
              {SHARE_TEXT}
            </CopyButton>
          )}
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

Receive.navigationOptions = {
  title: 'Receive G$',
}

const getStylesFromProps = ({ theme }) => ({
  space: {
    height: theme.sizes.defaultDouble,
  },
  mainText: {
    marginBottom: theme.sizes.default,
  },
})

export default withStyles(getStylesFromProps)(Receive)
