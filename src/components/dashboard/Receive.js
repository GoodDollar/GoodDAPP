// @flow
import React, { useCallback, useMemo } from 'react'
import { PixelRatio, View } from 'react-native'
import { t } from '@lingui/macro'
import { isBrowser, isMobileOnlyWeb } from '../../lib/utils/platform'
import useNativeSharing from '../../lib/hooks/useNativeSharing'
import { fireEvent, RECEIVE_DONE } from '../../lib/analytics/analytics'
import { useWallet } from '../../lib/wallet/GoodWalletProvider'
import { PushButton } from '../appNavigation/PushButton'
import { CopyButton, CustomButton, QRCode, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight, getMaxDeviceHeight } from '../../lib/utils/sizes'
import { generateCode, generateReceiveShareObject, isSharingAvailable } from '../../lib/share'
import useProfile from '../../lib/userStorage/useProfile'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

// This condition recognizes the devices which resolution is higher than Iphone 6/7/8 Plus
const useTopSpaceForMobile = isMobileOnlyWeb && PixelRatio.get() >= 2 && getMaxDeviceHeight() >= 622

const SHARE_TEXT = t`Receive via wallet link`
const amount = 0
const reason = ''

const Receive = ({ screenProps, styles }: ReceiveProps) => {
  const { fullName } = useProfile() || {}
  const goodWallet = useWallet()
  const share = useMemo(() => {
    const { account, networkId } = goodWallet
    const code = generateCode(account, networkId, amount, reason)
    const shareObject = generateReceiveShareObject(code, amount, '', fullName)

    return shareObject
  }, [fullName, goodWallet])

  const shareLink = useMemo(() => {
    const { url, message } = share || {}

    return `${message} ${url}`
  }, [share])

  const fireReceiveDoneEvent = useCallback(() => fireEvent(RECEIVE_DONE, { type: 'wallet' }), [])
  const shareHandler = useNativeSharing(share, { onSharePress: fireReceiveDoneEvent })

  return (
    <Wrapper>
      <TopBar hideBalance={false} push={screenProps.push}>
        <View style={{ height: 44 }} />
      </TopBar>
      <Section grow style={styles.topContainer}>
        {isBrowser && <View style={styles.emptySpace} />}
        <Section.Stack
          alignItems="center"
          justifyContent="center"
          style={useTopSpaceForMobile ? styles.emptySpaceMobile : undefined}
        >
          <Section.Text fontSize={16} fontWeight="medium" style={styles.mainText}>
            {t`Let someone scan your wallet address`}
          </Section.Text>
          <QRCode value={share.url} size={150} />
        </Section.Stack>
        <Section.Stack grow justifyContent="center" alignItems="center" style={styles.orText}>
          <Section.Text fontSize={14}>- OR -</Section.Text>
        </Section.Stack>
        <Section.Stack alignItems="stretch">
          <PushButton
            dark={false}
            routeName="Amount"
            mode="outlined"
            screenProps={screenProps}
            params={{
              nextRoutes: ['Reason', 'ReceiveSummary', 'TransactionConfirmation'],
              action: 'Receive',
            }}
          >
            {t`Request specific amount`}
          </PushButton>
          <View style={styles.space} />
          {isSharingAvailable ? (
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
  title: t`Receive G$`,
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
  topContainer: {
    marginBottom: theme.paddings.bottomPadding,
  },
})

export default withStyles(getStylesFromProps)(Receive)
