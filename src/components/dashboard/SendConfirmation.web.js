// @flow
import React from 'react'
import { View } from 'react-native'
import { useScreenState } from '../appNavigation/stackNavigation'
import CopyButton from '../common/buttons/CopyButton'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import TopBar from '../common/view/TopBar'
import { withStyles } from '../../lib/styles'
import { Icon } from '../common'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'

import './AButton.css'
import BigGoodDollar from '../common/view/BigGoodDollar'
import normalize from '../../lib/utils/normalizeText'
import { SEND_TITLE } from './utils/sendReceiveFlow'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const SendConfirmation = ({ screenProps, styles }: ReceiveProps) => {
  const [screenState] = useScreenState(screenProps)

  const { amount, reason, paymentLink } = screenState

  return (
    <Wrapper>
      <TopBar hideBalance push={screenProps.push} />
      <Section grow style={styles.section}>
        <Section.Text style={styles.confirmationDescription} fontSize={22} fontWeight="medium">
          {'To complete the transaction\ncopy the link and share it\nwith your recipient.'}
        </Section.Text>
        <Section.Stack>
          <Section.Row justifyContent="center">
            <View style={styles.sendIconWrapper}>
              <Icon name="send" size={getDesignRelativeHeight(45)} color="white" />
            </View>
          </Section.Row>
          <Section.Title fontWeight="medium" style={styles.amountWrapper}>
            <BigGoodDollar
              number={amount}
              color="red"
              bigNumberProps={{
                fontSize: 36,
                lineHeight: 24,
                fontFamily: 'Roboto Slab',
                fontWeight: 'bold',
              }}
              bigNumberUnitProps={{ fontSize: 14 }}
            />
          </Section.Title>
        </Section.Stack>
        {reason && (
          <Section.Row style={[styles.forTextWrapper, styles.sendForTextWrapper]}>
            <Section.Text color="gray80Percent" fontSize={14} style={styles.toForLabel}>
              For
            </Section.Text>
            <Section.Text fontSize={normalize(14)} numberOfLines={2} ellipsizeMode="tail" style={styles.reasonText}>
              {reason}
            </Section.Text>
          </Section.Row>
        )}
        <CopyButton toCopy={paymentLink} onPressDone={() => screenProps.goToRoot()}>
          Copy link to clipboard
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
  confirmationDescription: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: getDesignRelativeHeight(15),
  },
  sendIconWrapper: {
    height: getDesignRelativeHeight(75),
    width: getDesignRelativeHeight(75),
    backgroundColor: theme.colors.red,
    position: 'relative',
    borderRadius: '50%',
    marginTop: getDesignRelativeHeight(15),
    marginBottom: getDesignRelativeHeight(24),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: getDesignRelativeHeight(10),
  },
  forTextWrapper: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.colors.gray50Percent,
    borderRadius: 25,
    height: 42,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: getDesignRelativeHeight(4),
    position: 'relative',
    marginVertical: getDesignRelativeHeight(25),
  },
  sendForTextWrapper: {
    alignItems: 'center',
    paddingBottom: 0,
  },
  toForLabel: {
    position: 'absolute',
    top: -getDesignRelativeHeight(10),
    backgroundColor: theme.colors.white,
    paddingHorizontal: getDesignRelativeHeight(10),
    lineHeight: normalize(14),
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
