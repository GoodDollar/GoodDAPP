// @flow
import React, { useCallback, useMemo } from 'react'
import { Image, View } from 'react-native'
import { useScreenState } from '../appNavigation/stackNavigation'
import useNativeSharing from '../../lib/hooks/useNativeSharing'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import ButtonWithDoneState from '../common/buttons/ButtonWithDoneState'
import CustomButton from '../common/buttons/CustomButton'
import Icon from '../common/view/Icon'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import { fireEvent } from '../../lib/analytics/analytics'
import ConfirmTransactionSVG from '../../assets/confirmTransaction.svg'
import useClipboard from '../../lib/hooks/useClipboard'
import { ACTION_RECEIVE, ACTION_SEND, PARAM_ACTION, RECEIVE_TITLE, SEND_TITLE } from './utils/sendReceiveFlow'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const instructionsTextProps = {
  fontSize: 16,
  fontWeight: 'medium',
  lineHeight: 28,
  letterSpacing: 0.16,
  style: {
    textAlign: 'left',
  },
}
const instructionsTextNumberProps = {
  ...instructionsTextProps,
  fontWeight: 'bold',
}

const TransactionConfirmation = ({ screenProps, styles }: ReceiveProps) => {
  const { canShare, shareAction } = useNativeSharing()
  const { goToRoot } = screenProps
  const [screenState] = useScreenState(screenProps)
  const { paymentLink, action } = screenState
  const { setString } = useClipboard()

  const handlePressConfirm = useCallback(() => {
    let type = 'share'

    if (canShare) {
      shareAction(paymentLink)
      goToRoot()
    } else {
      if (!setString(paymentLink)) {
        // needed to not fire SEND_CONFIRMATION_SHARE if setString to Clipboard is failed
        return
      }

      type = 'copy'
    }

    fireEvent('SEND_CONFIRMATION_SHARE', { type })
  }, [canShare, paymentLink, goToRoot, shareAction])

  const secondTextPoint = action === ACTION_SEND ? 'Share it with your recipient' : 'Share it with sender'
  const thirdTextPoint = action === ACTION_SEND ? 'Recipient approves request' : 'Sender approves request'

  const ConfirmButton = useMemo(() => (canShare ? CustomButton : ButtonWithDoneState), [canShare])

  return (
    <Wrapper>
      <Section grow style={styles.section} justifyContent="space-between">
        <Section.Stack style={styles.textContainer}>
          <Section.Text style={styles.confirmationTitle} fontSize={22} fontWeight="bold">
            Complete Your Transaction:
          </Section.Text>
          <Section.Stack style={styles.instructionsText}>
            <Section.Text {...instructionsTextProps}>
              <Section.Text {...instructionsTextNumberProps}>{'1. '}</Section.Text>
              Copy the link below
            </Section.Text>
            <Section.Text {...instructionsTextProps}>
              <Section.Text {...instructionsTextNumberProps}>{'2. '}</Section.Text>
              {secondTextPoint}
            </Section.Text>
            <Section.Text {...instructionsTextProps}>
              <Section.Text {...instructionsTextNumberProps}>{'3. '}</Section.Text>
              {thirdTextPoint}
            </Section.Text>
            <Section.Text {...instructionsTextProps}>
              <Section.Text {...instructionsTextNumberProps}>{'4. '}</Section.Text>
              GoodDollars are transferred
            </Section.Text>
          </Section.Stack>
        </Section.Stack>
        <Image style={styles.image} source={ConfirmTransactionSVG} resizeMode="contain" />
        <View style={styles.confirmButtonWrapper}>
          <ConfirmButton testID={paymentLink} onPress={handlePressConfirm} onPressDone={goToRoot}>
            <>
              <Icon color="white" name="link" size={25} style={styles.buttonIcon} />
              <Section.Text size={14} color="white" fontWeight="bold">
                {canShare ? 'SHARE' : 'COPY LINK TO CLIPBOARD'}
              </Section.Text>
            </>
          </ConfirmButton>
        </View>
      </Section>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => ({
  section: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  textContainer: {
    marginTop: 'auto',
  },
  confirmationTitle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getDesignRelativeHeight(16),
  },
  instructionsText: {
    display: 'flex',
    justifyContent: 'flex-start',
    textAlign: 'left',
    marginHorizontal: 'auto',
  },
  image: {
    width: '100%',
    height: getDesignRelativeHeight(150, false),
    marginTop: 'auto',
  },
  confirmButtonWrapper: {
    marginTop: 'auto',
  },
  buttonIcon: {
    marginRight: getDesignRelativeWidth(10),
  },
})

TransactionConfirmation.navigationOptions = ({ navigation }) => {
  const action = navigation.getParam(PARAM_ACTION)

  return {
    title: action === ACTION_RECEIVE ? RECEIVE_TITLE : SEND_TITLE,
    backButtonHidden: true,
  }
}

export default withStyles(getStylesFromProps)(TransactionConfirmation)
