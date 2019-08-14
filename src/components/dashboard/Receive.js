// @flow
import React, { useMemo } from 'react'
import { isMobile } from 'mobile-device-detect'
import { generateCode, generateReceiveShareObject } from '../../lib/share'
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

const RECEIVE_TITLE = 'Receive G$'
const SHARE_TEXT = 'Share your wallet link'

const Receive = ({ screenProps, styles, ...props }: ReceiveProps) => {
  const profile = GDStore.useStore().get('profile')
  const { account, networkId } = goodWallet

  const [showErrorDialog] = useErrorDialog()
  const amount = 0
  const reason = ''

  const code = useMemo(() => generateCode(account, networkId, amount, reason), [account, networkId, amount, reason])
  const share = useMemo(() => generateReceiveShareObject(code, amount, '', profile.fullName), [code])

  const shareAction = async () => {
    try {
      await navigator.share(share)
    } catch (e) {
      if (e.name !== 'AbortError') {
        showErrorDialog(e)
      }
    }
  }

  return (
    <Wrapper>
      <TopBar hideBalance={false} push={screenProps.push}>
        <ScanQRButton onPress={() => screenProps.push('ReceiveByQR')} />
      </TopBar>
      <Section grow>
        <Section.Stack grow={3} justifyContent="space-around" alignItems="center">
          <Section.Text fontSize={14} color="darkGray" style={styles.mainText}>
            {'Let someone scan your wallet address'}
          </Section.Text>
          <QRCode value={code} />
        </Section.Stack>
        <Section.Stack grow={1} justifyContent="center" alignItems="center">
          <Section.Text fontSize={14} color="darkGray">
            {'- OR -'}
          </Section.Text>
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
          {isMobile && navigator.share ? (
            <CustomButton style={styles.shareButton} onPress={shareAction}>
              {SHARE_TEXT}
            </CustomButton>
          ) : (
            <CopyButton style={styles.shareButton} toCopy={account} onPressDone={screenProps.goToRoot}>
              {SHARE_TEXT}
            </CopyButton>
          )}
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

Receive.navigationOptions = {
  title: RECEIVE_TITLE,
}

const getStylesFromProps = ({ theme }) => ({
  shareButton: {
    marginTop: theme.sizes.defaultDouble,
  },
  mainText: {
    marginBottom: theme.sizes.default,
  },
})

export default withStyles(getStylesFromProps)(Receive)
