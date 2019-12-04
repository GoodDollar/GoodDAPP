// @flow
import React, { useMemo } from 'react'
import { isMobile } from 'mobile-device-detect'
import { fireEvent } from '../../lib/analytics/analytics'
import GDStore from '../../lib/undux/GDStore'
import {
  generateReceiveShareObject,
  generateReceiveShareText,
  generateSendShareObject,
  generateSendShareText,
} from '../../lib/share'
import BigGoodDollar from '../common/view/BigGoodDollar'
import QRCode from '../common/view/QRCode'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import ShareButton from '../common/buttons/ShareButton'
import TopBar from '../common/view/TopBar'

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
  const { params } = props.navigation.state

  const share = useMemo(() => {
    if (isMobile && navigator.share) {
      return params.action === ACTION_RECEIVE
        ? generateReceiveShareObject(code, amount, counterPartyDisplayName, profile.fullName)
        : generateSendShareObject(code, amount, counterPartyDisplayName, profile.fullName)
    }

    return params.action === ACTION_RECEIVE
      ? {
          url: generateReceiveShareText(code, amount, counterPartyDisplayName, profile.fullName),
        }
      : {
          url: generateSendShareText(code, amount, counterPartyDisplayName, profile.fullName),
        }
  }, [code])

  return (
    <Wrapper>
      <TopBar push={screenProps.push} hideBalance />
      <Section justifyContent="space-between" grow>
        <Section.Stack style={styles.qrCode}>
          <QRCode value={code} />
        </Section.Stack>
        <Section.Stack grow justifyContent="center" alignItems="center">
          <Section.Text style={styles.textRow}>{ACTION_RECEIVE ? 'Request exactly' : 'Send exactly'}</Section.Text>
          {counterPartyDisplayName && (
            <Section.Text style={styles.textRow}>
              {ACTION_RECEIVE ? 'From: ' : 'To: '}
              <Section.Text fontSize={18}>{counterPartyDisplayName}</Section.Text>
            </Section.Text>
          )}
          {amount && (
            <BigGoodDollar
              number={amount}
              color="primary"
              bigNumberProps={{ fontSize: 24 }}
              bigNumberUnitProps={{ fontSize: 14 }}
            />
          )}
          <Section.Text style={styles.textRow}>{reason}</Section.Text>
        </Section.Stack>
        <Section.Stack>
          <ShareButton
            share={share}
            onPressDone={() => {
              fireEvent('RECEIVE', { type: 'link' })
              screenProps.goToRoot
            }}
            actionText="Share as link"
          />
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
      marginVertical: theme.sizes.default,
    },
    doneButton: {
      marginTop: theme.paddings.defaultMargin,
    },
  }
}

export default withStyles(getStylesFromProps)(ReceiveConfirmation)
