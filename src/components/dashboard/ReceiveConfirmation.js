// @flow
import React, { useCallback, useMemo } from 'react'
import { Share } from 'react-native'
import { fireEvent } from '../../lib/analytics/analytics'
import Clipboard from '../../lib/utils/Clipboard'
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
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { navigationOptions } from './utils/sendReceiveFlow'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const ReceiveConfirmation = ({ screenProps, styles }: ReceiveProps) => {
  const profile = GDStore.useStore().get('profile')
  const [showErrorDialog] = useErrorDialog()
  const [screenState] = useScreenState(screenProps)
  const { canShare, generateReceiveShareObject, generateReceiveShareText, generateShareLink } = useNativeSharing()
  const { amount, code, reason, counterPartyDisplayName } = screenState

  const share = useMemo(() => {
    if (canShare) {
      return generateReceiveShareObject(code, amount, counterPartyDisplayName, profile.fullName)
    }
    return generateReceiveShareText(code, amount, counterPartyDisplayName, profile.fullName)
  }, [code, canShare, generateReceiveShareObject, generateReceiveShareText])

  const urlForQR = useMemo(() => {
    return generateShareLink('receive', code)
  }, [code, generateShareLink])

  const shareActionPressHandler = useCallback(async () => {
    let executeShare

    if (canShare) {
      executeShare = Share.share
    } else {
      executeShare = Clipboard.setString
    }

    try {
      await executeShare(share)
    } catch (e) {
      if (e.name !== 'AbortError') {
        showErrorDialog('Sorry, there was an error sharing you link. Please try again later.')
      }
    }
  }, [canShare, showErrorDialog])

  const shareActionDonePressHandler = useCallback(() => {
    fireEvent('RECEIVE_DONE', { type: 'link' })
    screenProps.goToRoot()
  }, [screenProps])

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
                bigNumberProps={{ fontSize: 36, lineHeight: 36, fontWeight: 'bold', fontFamily: 'Roboto Slab' }}
                bigNumberUnitProps={{ fontSize: 14 }}
              />
            )}
            {!!reason && <Section.Text style={styles.textRow}>For {reason}</Section.Text>}
          </Section.Stack>
        </Section.Stack>
        <Section.Stack>
          <ShareLinkReceiveAnimationButton
            onPress={shareActionPressHandler}
            onPressDone={shareActionDonePressHandler}
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
