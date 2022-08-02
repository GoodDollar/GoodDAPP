// @flow
import React, { useCallback } from 'react'
import { View } from 'react-native'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import ShareOrCopyButton from '../common/animations/ShareOrCopyButton/ShareOrCopyButtonAnimated'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import { fireEvent, SEND_CONFIRMATION_SHARE } from '../../lib/analytics/analytics'
import ConfirmTransactionSVG from '../../assets/confirmTransaction.svg'
import useCachedScreenState from '../../lib/hooks/useCachedScreenState'
import { isSharingAvailable } from '../../lib/share'
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
  const { goToRoot } = screenProps
  const { paymentLink = { url: 'test' }, action } = useCachedScreenState(screenProps, 'GD_sharingCache')

  const isSending = action === ACTION_SEND
  const secondTextPoint = isSending ? 'Share it with your recipient' : 'Share it with sender'
  const thirdTextPoint = isSending ? 'Recipient approves request' : 'Sender approves request'

  const fireShared = useCallback(() => {
    fireEvent(SEND_CONFIRMATION_SHARE, { action, type: isSharingAvailable ? 'share' : 'copy' })
  }, [action])

  return (
    <Wrapper>
      <Section grow style={styles.section} justifyContent="space-between" alignItems="center">
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
        <View style={styles.image}>
          <ConfirmTransactionSVG />
        </View>
        <View style={styles.confirmButtonWrapper}>
          <ShareOrCopyButton
            testID={paymentLink.url}
            onShareOrCopy={fireShared}
            shareObject={paymentLink}
            onPressDone={goToRoot}
          />
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
    marginBottom: theme.paddings.bottomPadding,
  },
  textContainer: {
    marginTop: 'auto',
    alignItems: 'center',
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
    alignItems: 'center',
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
