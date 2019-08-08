// @flow
import React, { useMemo } from 'react'
import { isMobile } from 'mobile-device-detect'
import normalize from '../../lib/utils/normalizeText'
import GDStore from '../../lib/undux/GDStore'
import { generateReceiveShareObject, generateSendShareObject } from '../../lib/share'
import { BigGoodDollar, CopyButton, CustomButton, QRCode, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { useErrorDialog } from '../../lib/undux/utils/dialog'

import { useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import { ACTION_RECEIVE, navigationOptions } from './utils/sendReceiveFlow'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const ReceiveConfirmation = ({ screenProps, styles, ...props }: ReceiveProps) => {
  const profile = GDStore.useStore().get('profile')
  const [screenState] = useScreenState(screenProps)
  const { amount, code, reason, counterPartyDisplayName } = screenState
  const [showErrorDialog] = useErrorDialog()
  const { params } = props.navigation.state

  const share = useMemo(
    () =>
      params.action === ACTION_RECEIVE
        ? generateReceiveShareObject(code, amount, counterPartyDisplayName, profile.fullName)
        : generateSendShareObject(code, amount, counterPartyDisplayName, profile.fullName),
    [code]
  )

  const shareAction = async () => {
    try {
      await navigator.share(share)
    } catch (e) {
      if (e.name !== 'AbortError') {
        showErrorDialog(e)
      }
    }
  }
  console.info({ styles })
  return (
    <Wrapper>
      <TopBar push={screenProps.push} hideBalance />
      <Section justifyContent="space-between" grow>
        <Section.Stack style={styles.qrCode}>
          <QRCode value={code} />
        </Section.Stack>
        <Section.Stack grow justifyContent="center" alignItems="center">
          <Section.Text style={[styles.textRow]}>{ACTION_RECEIVE ? 'Request exactly' : 'Send exactly'}</Section.Text>
          {counterPartyDisplayName && (
            <Section.Text style={[styles.textRow]}>
              {ACTION_RECEIVE ? 'From: ' : 'To: '}
              <Section.Text style={styles.counterPartyDisplayName}>{counterPartyDisplayName}</Section.Text>
            </Section.Text>
          )}
          {amount && (
            <BigGoodDollar
              bigNumberStyles={styles.bigGoodDollar}
              bigNumberUnitStyles={styles.bigGoodDollarUnit}
              number={amount}
              color={props.theme.colors.primary}
            />
          )}
          <Section.Text style={[styles.textRow]}>{reason}</Section.Text>
        </Section.Stack>
        <Section.Stack>
          {isMobile && navigator.share ? (
            <CustomButton onPress={shareAction}>Share as link</CustomButton>
          ) : (
            <CopyButton toCopy={share.url} onPressDone={screenProps.goToRoot}>
              Share as link
            </CopyButton>
          )}
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

ReceiveConfirmation.navigationOptions = navigationOptions

ReceiveConfirmation.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.amount
}

const getStylesFromProps = ({ theme }) => {
  return {
    qrCode: {
      paddingTop: theme.sizes.default,
    },
    textRow: {
      marginBottom: theme.sizes.default,
      marginTop: theme.sizes.default,
    },
    doneButton: {
      marginTop: theme.paddings.defaultMargin,
    },
    bigGoodDollar: {
      fontFamily: theme.fonts.default,
      fontSize: normalize(24),
      fontWeight: '700',
    },
    bigGoodDollarUnit: {
      fontFamily: theme.fonts.default,
      fontSize: normalize(14),
      fontWeight: '700',
    },
    counterPartyDisplayName: {
      fontSize: normalize(18),
    },
  }
}

export default withStyles(getStylesFromProps)(ReceiveConfirmation)
