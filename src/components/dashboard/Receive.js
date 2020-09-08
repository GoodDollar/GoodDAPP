// @flow
import React, { useCallback, useMemo } from 'react'
import { PixelRatio, View } from 'react-native'
import { isBrowser, isMobileOnlyWeb } from '../../lib/utils/platform'
import useNativeSharing from '../../lib/hooks/useNativeSharing'
import { fireEvent } from '../../lib/analytics/analytics'
import GDStore from '../../lib/undux/GDStore'
import goodWallet from '../../lib/wallet/GoodWallet'
import { PushButton } from '../appNavigation/PushButton'
import { CopyButton, CustomButton, QRCode, ReceiveToAddressButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight, getMaxDeviceHeight } from '../../lib/utils/sizes'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

// This condition recognizes the devices which resolution is higher than Iphone 6/7/8 Plus
const useTopSpaceForMobile = isMobileOnlyWeb && PixelRatio.get() >= 2 && getMaxDeviceHeight() >= 622

const SHARE_TEXT = 'Receive via wallet link'

const Receive = ({ screenProps, styles }: ReceiveProps) => {
  const profile = GDStore.useStore().get('profile')
  const { account, networkId } = goodWallet
  const { canShare, generateCode, generateReceiveShareObject, shareAction } = useNativeSharing()
  const amount = 0
  const reason = ''
  const codeObj = useMemo(() => generateCode(account, networkId, amount, reason), [account, networkId, amount, reason])
  const share = useMemo(() => generateReceiveShareObject(codeObj, amount, '', profile.fullName), [
    codeObj,
    profile.fullName,
    amount,
  ])

  const shareLink = useMemo(() => share.message + ' ' + share.url, [share])

  const fireReceiveDoneEvent = useCallback(() => fireEvent('RECEIVE_DONE', { type: 'wallet' }), [])

  const shareHandler = useCallback(() => {
    // not mandatory to await for shareAction as there no visual changes after it
    shareAction(share)
    fireReceiveDoneEvent()
  }, [shareAction, share])

  const onPressReceiveToAddressButton = useCallback(() => screenProps.push('ReceiveToAddress'), [screenProps])

  return (
    <Wrapper>
      <TopBar hideBalance={false} push={screenProps.push}>
        <View />
        <ReceiveToAddressButton onPress={onPressReceiveToAddressButton} />
      </TopBar>
      <Section grow>
        {isBrowser && <View style={styles.emptySpace} />}
        <Section.Stack
          alignItems="center"
          justifyContent="center"
          style={useTopSpaceForMobile ? styles.emptySpaceMobile : undefined}
        >
          <Section.Text fontSize={16} fontWeight="medium" style={styles.mainText}>
            Let someone scan your wallet address
          </Section.Text>
          <QRCode value={shareLink} />
        </Section.Stack>
        <Section.Stack grow justifyContent="center" alignItems="center" style={styles.orText}>
          <Section.Text fontSize={14}>- OR -</Section.Text>
        </Section.Stack>
        <Section.Stack alignItems="stretch">
          <PushButton
            dark={false}
            routeName="Who"
            mode="outlined"
            screenProps={screenProps}
            params={{
              nextRoutes: ['Amount', 'Reason', 'ReceiveSummary', 'TransactionConfirmation'],
              params: { action: 'Receive' },
            }}
          >
            Request specific amount
          </PushButton>
          <View style={styles.space} />
          {canShare ? (
            <CustomButton onPress={shareHandler}>{SHARE_TEXT}</CustomButton>
          ) : (
            <CopyButton
              style={styles.shareButton}
              toCopy={shareLink}
              onPress={fireReceiveDoneEvent}
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
  emptySpace: {
    height: '25%',
  },
  emptySpaceMobile: {
    marginTop: getDesignRelativeHeight(55),
  },
  space: {
    height: theme.sizes.defaultDouble,
  },
  orText: {
    marginVertical: 20,
  },
  mainText: {
    marginBottom: getDesignRelativeHeight(24),
  },
})

export default withStyles(getStylesFromProps)(Receive)
