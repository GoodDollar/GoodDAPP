// @flow
import React, { useCallback, useMemo } from 'react'
import { fireEvent } from '../../lib/analytics/analytics'
import { useClipboardCopy } from '../../lib/hooks/useClipboard'
import GDStore from '../../lib/undux/GDStore'
import BigGoodDollar from '../common/view/BigGoodDollar'
import QRCode from '../common/view/QrCode/QRCode'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import ShareLinkReceiveAnimationButton from '../common/animations/ShareLinkReceiveButton/ShareLinkReceiveButton'
import TopBar from '../common/view/TopBar'
import useNativeSharing from '../../lib/hooks/useNativeSharing'

import { useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import {
  generateReceiveShareObject,
  generateReceiveShareText,
  generateShareLink,
  isSharingAvailable,
} from '../../lib/share'
import { navigationOptions } from './utils/sendReceiveFlow'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const ReceiveConfirmation = ({ screenProps, styles }: ReceiveProps) => {
  const store = GDStore.useStore()
  const [screenState] = useScreenState(screenProps)

  const { amount, code, reason, counterPartyDisplayName } = screenState
  const { fullName } = store.get('profile') || {}
  const { goToRoot, push } = screenProps

  const shareOrText = useMemo(() => {
    const factory = isSharingAvailable ? generateReceiveShareObject : generateReceiveShareText

    return factory(code, amount, counterPartyDisplayName, fullName)
  }, [code, amount, counterPartyDisplayName, fullName])

  const urlForQR = useMemo(() => generateShareLink('receive', code), [code])

  const shareHandler = useNativeSharing(shareOrText)
  const copyHandler = useClipboardCopy(shareOrText)

  const shareDonePressHandler = useCallback(() => {
    fireEvent('RECEIVE_DONE', { type: 'link' })
    goToRoot()
  }, [goToRoot])

  return (
    <Wrapper>
      <TopBar push={push} />
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
                bigNumberProps={{ fontSize: 36, lineHeight: 36, fontWeight: 'bold', fontFamily: 'Roboto Slab' }}
                bigNumberUnitProps={{ fontSize: 14 }}
              />
            )}
            {!!reason && <Section.Text style={styles.textRow}>For {reason}</Section.Text>}
          </Section.Stack>
        </Section.Stack>
        <Section.Stack>
          <ShareLinkReceiveAnimationButton
            onPress={isSharingAvailable ? shareHandler : copyHandler}
            onPressDone={shareDonePressHandler}
          />
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

ReceiveConfirmation.navigationOptions = navigationOptions

ReceiveConfirmation.shouldNavigateToComponent = ({ screenProps }) => {
  const { screenState } = screenProps

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
