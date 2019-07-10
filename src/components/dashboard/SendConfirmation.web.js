// @flow
import QRCode from 'qrcode.react'

import React from 'react'
import { View } from 'react-native'
import { normalize } from 'react-native-elements'
import { isMobile } from 'mobile-device-detect'
import { generateSendShareObject } from '../../lib/share'
import { useDialog } from '../../lib/undux/utils/dialog'
import { DoneButton, useScreenState } from '../appNavigation/stackNavigation'
import { BigGoodDollar, CopyButton, CustomButton, Section, Text, TopBar, Wrapper } from '../common'
import { withStyles } from '../../lib/styles'
import { getScreenHeight } from '../../lib/utils/Orientation'

import './AButton.css'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const SEND_TITLE = 'Send G$'
const SendConfirmation = ({ screenProps, styles }: ReceiveProps) => {
  const [screenState] = useScreenState(screenProps)
  const [showDialog] = useDialog()

  const { amount, reason, paymentLink } = screenState
  const share = generateSendShareObject(paymentLink)

  const shareAction = async () => {
    try {
      await navigator.share(share)
    } catch (e) {
      showDialog({
        visible: true,
        title: 'Error',
        message:
          'There was a problem triggering share action. You can still copy the link in tapping on "Copy link to clipboard"',
        dismissText: 'Ok',
      })
    }
  }

  const ShareButton = () => (
    <CustomButton onPress={shareAction} mode="contained">
      Share Link
    </CustomButton>
  )

  return (
    <Wrapper>
      <TopBar hideBalance push={screenProps.push} />
      <Section style={styles.section}>
        <View style={styles.topContainer}>
          <Section.Row style={styles.sectionRow}>
            <View style={styles.qrCode}>
              <QRCode value={paymentLink || ''} />
            </View>
            <Section.Text style={styles.addressSection}>
              <Text style={styles.url}>{share.url}</Text>
            </Section.Text>
            <Section.Text style={styles.reasonText}>
              {`Here's `}
              <BigGoodDollar number={amount} />
            </Section.Text>
            <Section.Text style={styles.reasonText}>{reason && `For ${reason}`}</Section.Text>
          </Section.Row>
        </View>
      </Section>
      <View style={styles.buttonGroup}>
        {isMobile && navigator.share ? (
          <ShareButton style={styles.shareButton} />
        ) : (
          <CopyButton toCopy={share.url}>Copy link to clipboard</CopyButton>
        )}
        <DoneButton style={styles.doneButton} screenProps={screenProps} />
      </View>
    </Wrapper>
  )
}

SendConfirmation.navigationOptions = {
  title: SEND_TITLE,
  backButtonHidden: true,
}

SendConfirmation.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return !!screenState.paymentLink
}

const getStylesFromProps = ({ theme }) => {
  return {
    section: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      alignContent: 'stretch',
      paddingTop: normalize(22),
    },
    sectionRow: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
    },
    sectionTop: {
      flex: 2,
      flexDirection: 'column',
      maxWidth: '100%',
      alignItems: 'center',
    },
    buttonGroup: {
      width: '100%',
      flexDirection: 'column',
      marginTop: getScreenHeight() > 600 ? '1rem' : 0,
      display: 'flex',
      justifyContent: 'flex-end',
    },
    qrCode: {
      marginTop: getScreenHeight() > 600 ? '2rem' : 0,
      padding: '1rem',
      borderColor: '#555',
      borderWidth: 1,
      borderRadius: '4px',
    },
    addressSection: {
      marginBottom: '1rem',
      marginTop: '1rem',
      maxWidth: '100%',
    },
    url: {
      ...theme.fontStyle,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      maxWidth: '100%',
      paddingLeft: '1rem',
      paddingRight: '1rem',
    },
    shareButton: {
      marginTop: 0,
    },
    doneButton: {
      marginTop: '1em',
    },
    secondaryText: {
      margin: '1rem',
      color: '#555',
      fontSize: normalize(14),
      textTransform: 'uppercase',
    },
    reasonText: {
      color: '#555',
      fontSize: normalize(16),
    },
  }
}

export default withStyles(getStylesFromProps)(SendConfirmation)
