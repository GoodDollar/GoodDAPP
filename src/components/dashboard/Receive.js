// @flow
import React, { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { withTheme } from 'react-native-paper'
import { isMobile } from 'mobile-device-detect'
import { generateCode, generateReceiveShareObject } from '../../lib/share'

import { useErrorDialog } from '../../lib/undux/utils/dialog'
import goodWallet from '../../lib/wallet/GoodWallet'
import { PushButton } from '../appNavigation/stackNavigation'
import { CopyButton, CustomButton, QRCode, ScanQRButton, Section, TopBar, Wrapper } from '../common'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive G$'
const SHARE_TEXT = 'Share your wallet link'

const Receive = ({ screenProps, ...props }: ReceiveProps) => {
  const { account, networkId } = goodWallet

  const [showErrorDialog] = useErrorDialog()
  const amount = 0
  const reason = ''

  const code = useMemo(() => generateCode(account, networkId, amount, reason), [account, networkId, amount, reason])
  const share = useMemo(() => generateReceiveShareObject(code), [code])
  const styles = getStylesFromProps(props)

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
          <Section.Text style={styles.marginBottom}>Let someone scan your wallet address </Section.Text>
          <QRCode value={code} />
        </Section.Stack>
        <Section.Stack grow={1} justifyContent="center" alignItems="center">
          <Section.Text> - OR - </Section.Text>
        </Section.Stack>
        <Section.Stack alignItems="stretch">
          <PushButton
            dark={false}
            routeName="Amount"
            mode="outlined"
            screenProps={screenProps}
            style={{ marginTop: 10 }}
            params={{ nextRoutes: ['Reason', 'ReceiveAmount'], params: { toReceive: true } }}
          >
            Request specific amount
          </PushButton>
          {isMobile && navigator.share ? (
            <CustomButton style={styles.marginTop} onPress={shareAction}>
              {SHARE_TEXT}
            </CustomButton>
          ) : (
            <CopyButton style={styles.marginTop} toCopy={account} onPressDone={screenProps.goToRoot}>
              {SHARE_TEXT}
            </CopyButton>
          )}
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

Receive.navigationOptions = {
  title: RECEIVE_TITLE
}

const getStylesFromProps = props => {
  const { theme } = props
  return StyleSheet.create({
    marginTop: {
      marginTop: theme.defaultMargin
    },
    marginBottom: {
      marginBottom: theme.defaultMargin
    }
  })
}

export default withTheme(Receive)
