// @flow
import React, { useMemo } from 'react'
import { isMobile } from 'mobile-device-detect'
import { fireEvent } from '../../lib/analytics/analytics'
import GDStore from '../../lib/undux/GDStore'
import { generateReceiveShareObject, generateReceiveShareText, generateShareLink } from '../../lib/share'
import BigGoodDollar from '../common/view/BigGoodDollar'
import QRCode from '../common/view/QrCode/QRCode'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import ShareButton from '../common/buttons/ShareButton'
import TopBar from '../common/view/TopBar'

import { useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import { navigationOptions } from './utils/sendReceiveFlow'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const ReceiveConfirmation = ({ screenProps, styles, ...props }: ReceiveProps) => {
  const profile = GDStore.useStore().get('profile')
  const [screenState] = useScreenState(screenProps)
  const { amount, code, reason, counterPartyDisplayName } = screenState
  const share = useMemo(() => {
    if (isMobile && navigator.share) {
      return generateReceiveShareObject(code, amount, counterPartyDisplayName, profile.fullName)
    }
    return {
      url: generateReceiveShareText(code, amount, counterPartyDisplayName, profile.fullName),
    }
  }, [code])

  const urlForQR = useMemo(() => {
    return generateShareLink('receive', code)
  }, [code])

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section justifyContent="space-between" grow>
        <Section.Stack justifyContent="space-evenly" grow>
          <Section.Stack style={styles.qrCode}>
            <QRCode value={urlForQR} />
          </Section.Stack>
          <Section.Stack justifyContent="center" alignItems="center">
            <Section.Text style={styles.textRow}>{'Request exactly'}</Section.Text>
            {amount && (
              <BigGoodDollar
                number={amount}
                color="green"
                bigNumberProps={{ fontSize: 36, lineHeight: 24, fontWeight: 'bold', fontFamily: 'Roboto Slab' }}
                bigNumberUnitProps={{ fontSize: 14 }}
              />
            )}
            {!!reason && <Section.Text style={styles.textRow}>For {reason}</Section.Text>}
          </Section.Stack>
        </Section.Stack>
        <Section.Stack>
          <ShareButton
            share={share}
            onPressDone={() => {
              fireEvent('RECEIVE_DONE', { type: 'link' })
              screenProps.goToRoot()
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
