// @flow
import React, { useCallback } from 'react'
import { Image } from 'react-native'
import { useScreenState } from '../appNavigation/stackNavigation'
import useNativeSharing from '../../lib/hooks/useNativeSharing'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import CopyButton from '../common/buttons/CopyButton'
import Icon from '../common/view/Icon'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import { fireEvent } from '../../lib/analytics/analytics'
import ConfirmTransactionSVG from '../../assets/confirmTransaction.svg'
import { SEND_TITLE } from './utils/sendReceiveFlow'

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

const SendConfirmation = ({ screenProps, styles }: ReceiveProps) => {
  const { canShare } = useNativeSharing()
  const [screenState] = useScreenState(screenProps)
  const { goToRoot } = screenProps
  const { paymentLink } = screenState

  const handlePressConfirm = useCallback(
    () => fireEvent('SEND_CONFIRMATION_SHARE', { type: canShare ? 'share' : 'copy' }),
    [canShare]
  )

  const handlePressDone = useCallback(() => goToRoot(), [goToRoot])

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
              Share it with your recipient
            </Section.Text>
            <Section.Text {...instructionsTextProps}>
              <Section.Text {...instructionsTextNumberProps}>{'3. '}</Section.Text>
              Recipient approves request
            </Section.Text>
            <Section.Text {...instructionsTextProps}>
              <Section.Text {...instructionsTextNumberProps}>{'4. '}</Section.Text>
              GoodDollars are transferred
            </Section.Text>
          </Section.Stack>
        </Section.Stack>
        <Image style={styles.image} source={ConfirmTransactionSVG} resizeMode="contain" />
        <CopyButton toCopy={paymentLink} onPress={handlePressConfirm} onPressDone={handlePressDone}>
          <>
            <Icon color="white" name="link" size={25} style={styles.buttonIcon} />
            <Section.Text color="white" fontWeight="bold">
              COPY LINK TO CLIPBOARD
            </Section.Text>
          </>
        </CopyButton>
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
    marginTop: getDesignRelativeHeight(50),
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
  },
  buttonIcon: {
    marginRight: getDesignRelativeWidth(15),
  },
})

SendConfirmation.navigationOptions = {
  title: SEND_TITLE,
  backButtonHidden: true,
}

SendConfirmation.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return !!screenState.paymentLink
}

export default withStyles(getStylesFromProps)(SendConfirmation)
