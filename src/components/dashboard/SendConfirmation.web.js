// @flow
import React from 'react'
import { Platform, View } from 'react-native'
import { isMobile } from 'mobile-device-detect'
import { useScreenState } from '../appNavigation/stackNavigation'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import TopBar from '../common/view/TopBar'
import useClipboard from '../../lib/hooks/useClipboard'
import { withStyles } from '../../lib/styles'
import logger from '../../lib/logger/pino-logger'
import { Icon } from '../common'
import AnimatedSendButton from '../common/animations/ShareLinkSendButton/ShareLinkSendButton'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import BigGoodDollar from '../common/view/BigGoodDollar'
import normalize from '../../lib/utils/normalizeText'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { fireEvent } from '../../lib/analytics/analytics'
import { SEND_TITLE } from './utils/sendReceiveFlow'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const log = logger.child({ from: 'SendConfirmation.web' })

const SendConfirmation = ({ screenProps, styles }: ReceiveProps) => {
  const [screenState] = useScreenState(screenProps)
  const [showErrorDialog] = useErrorDialog()
  const [, setString] = useClipboard()

  const { amount, reason, paymentLink } = screenState

  const shareAction = async () => {
    let type = 'copy'
    if (isMobile && navigator.share) {
      try {
        type = 'share'
        await navigator.share(paymentLink)
      } catch (e) {
        if (e.name !== 'AbortError') {
          log.error('Share link failed', e.message, e, {
            paymentLink,
            dialogShown: true,
          })
          showErrorDialog('Sorry, there was an error sharing you link. Please try again later.')
        }
      }
    } else {
      if (!(await setString(paymentLink))) {
        // needed to not fire SEND_CONFIRMATION_SHARE if setString to Clipboard is failed
        return
      }
    }

    fireEvent('SEND_CONFIRMATION_SHARE', { type })
  }

  return (
    <Wrapper>
      <TopBar hideBalance push={screenProps.push} />
      <Section grow style={styles.section}>
        <Section.Stack grow justifyContent="center">
          <Section.Text style={styles.confirmationDescription} fontSize={22} fontWeight="medium">
            {'To complete the transaction\ncopy the link and share it\nwith your recipient.'}
          </Section.Text>
          <Section.Stack style={styles.iconAmountBlock}>
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
            <Section.Row style={[styles.credsWrapper, styles.reasonWrapper]}>
              <Section.Text color="gray80Percent" fontSize={14} style={styles.credsLabel}>
                For
              </Section.Text>
              <Section.Text fontSize={normalize(14)} numberOfLines={2} ellipsizeMode="tail">
                {reason}
              </Section.Text>
            </Section.Row>
          )}
        </Section.Stack>
        <AnimatedSendButton onPress={shareAction} onPressDone={() => screenProps.goToRoot()} />
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
  },
  iconAmountBlock: {
    marginVertical: getDesignRelativeHeight(50),
  },
  sendIconWrapper: {
    height: getDesignRelativeHeight(75),
    width: getDesignRelativeHeight(75),
    backgroundColor: theme.colors.red,
    position: 'relative',
    borderRadius: Platform.select({
      default: getDesignRelativeHeight(75) / 2,
      web: '50%',
    }),
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
  credsWrapper: {
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
  credsLabel: {
    position: 'absolute',
    top: -getDesignRelativeHeight(10),
    backgroundColor: theme.colors.white,
    paddingHorizontal: getDesignRelativeHeight(10),
    lineHeight: normalize(14),
  },
  reasonWrapper: {
    alignItems: 'center',
    paddingBottom: 0,
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
