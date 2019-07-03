// @flow
import React, { useMemo } from 'react'
import { isMobile } from 'mobile-device-detect'
import { generateCode, generateReceiveShareObject } from '../../lib/share'
import GDStore from '../../lib/undux/GDStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import goodWallet from '../../lib/wallet/GoodWallet'
import { PushButton } from '../appNavigation/stackNavigation'
import { CopyButton, CustomButton, QRCode, ScanQRButton, Section, TopBar, Wrapper } from '../common'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive G$'

const Receive = ({ screenProps }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const [showDialogWithData] = useDialog()
  const store = GDStore.useStore()
  const amount = 0
  const reason = ''

  const code = useMemo(() => generateCode(account, networkId, amount, reason), [account, networkId, amount, reason])
  const share = useMemo(() => {
    try {
      return generateReceiveShareObject(code)
    } catch (e) {
      showDialogWithData({
        title: 'Error',
        message: e.message
      })
    }
  }, [code])

  const shareAction = async () => {
    try {
      await navigator.share(share)
    } catch (e) {
      store.set('currentScreen')({
        dialogData: {
          visible: true,
          title: 'Error',
          message:
            'There was a problem triggering share action. You can still copy the link in tapping on "Copy link to clipboard"',
          dismissText: 'Ok'
        }
      })
    }
  }

  const ShareButton = () => (
    <CustomButton onPress={shareAction} mode="contained">
      Share your wallet link
    </CustomButton>
  )

  return (
    <Wrapper>
      <TopBar hideBalance={false} push={screenProps.push}>
        <ScanQRButton onPress={() => screenProps.push('ReceiveByQR')} />
      </TopBar>
      <Section grow={1}>
        <Section.Stack grow={2} justifyContent="space-around" alignItems="center">
          <Section.Text>Scan this code to transfer G$ directly into your account.</Section.Text>
          <QRCode value={code} />
        </Section.Stack>
        <Section.Stack grow={1} justifyContent="center" alignItems="center">
          <Section.Text> - OR - </Section.Text>
        </Section.Stack>
        <Section.Stack alignItems="stretch">
          {isMobile && navigator.share ? <ShareButton /> : null}
          <CopyButton mode="outlined" toCopy={account}>
            Copy address to clipboard
          </CopyButton>
          <PushButton
            dark={false}
            routeName="Amount"
            screenProps={screenProps}
            style={{ marginTop: 10 }}
            params={{ nextRoutes: ['Reason', 'ReceiveAmount'], params: { toReceive: true } }}
          >
            Generate detailed request
          </PushButton>
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

Receive.navigationOptions = {
  title: RECEIVE_TITLE
}

export default Receive
