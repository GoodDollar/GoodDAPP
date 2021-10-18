// @flow

import React, { useCallback } from 'react'
import { View } from 'react-native'
import goodWallet from '../../lib/wallet/GoodWallet'
import InputText from '../common/form/InputText'
import { Section, Text, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import normalize from '../../lib/utils/normalizeText'
import CopyButton from '../common/buttons/CopyButton'
import { theme } from '../theme/styles'
import EventIcon from './FeedItems/EventIcon'

export type TypeProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const { account } = goodWallet

const warningBoxStyles = ({ theme }) => ({
  warningTextWrapper: {
    borderWidth: 2,
    borderRadius: 5,
    borderStyle: 'solid',
    borderColor: theme.colors.primary,
    width: 'auto',
    marginHorizontal: 'auto',
    marginBottom: getDesignRelativeHeight(20),
    paddingVertical: getDesignRelativeHeight(14),
    paddingHorizontal: getDesignRelativeWidth(6),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  icon: {
    height: getDesignRelativeHeight(57),
    width: getDesignRelativeWidth(57),
    marginRight: getDesignRelativeWidth(9),
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    transform: [{ rotate: '180deg' }],
  },
  text: {
    flex: 1,
    paddingRight: 6,
  },
})

export const GDTokensWarningBox = withStyles(warningBoxStyles)(({ styles, isSend = false, anim = true }) => (
  <View style={styles.warningTextWrapper}>
    <View style={styles.icon}>
      <EventIcon type="feedback" showAnim={anim} size={54} />
    </View>
    <Text
      fontSize={13.5}
      fontFamily={theme.fonts.slab}
      fontWeight="bold"
      textAlign="left"
      letterSpacing={0.14}
      lineHeight={21}
      color="red"
      style={styles.text}
    >
      {isSend
        ? `Keep in mind - your G$ tokens are on an internal network and should be sent on the G$ network and not to Ethereum external wallets`
        : `Keep in mind - Do not send tokens from Ethereum network to this address. This is an internal Network address for G$ tokens only.`}
    </Text>
  </View>
))

const ReceiveToAddress = ({ screenProps, styles, address }: TypeProps) => {
  const onPressDone = useCallback(screenProps.goToRoot)
  return (
    <Wrapper>
      <TopBar
        push={screenProps.push}
        hideProfile={false}
        profileAsLink={false}
        hideBalance
        contentStyle={{ justifyContent: 'center' }}
        avatarSize={56}
        style={{ paddingLeft: 8 }}
      >
        <View />
      </TopBar>
      <Section grow justifyContent="space-between">
        <Section.Title fontWeight="medium">YOUR WALLET ADDRESS:</Section.Title>
        <InputText
          containerStyle={styles.containerInput}
          style={styles.input}
          value={address || account}
          editable={false}
          showError={false}
        />
        <Text style={styles.copyText} fontSize={24} fontWeight="medium" lineHeight={30}>
          {'Copy & share it\nwith others'}
        </Text>
        <GDTokensWarningBox />
        <CopyButton style={styles.confirmButton} toCopy={address || account} onPressDone={onPressDone} />
      </Section>
    </Wrapper>
  )
}

ReceiveToAddress.navigationOptions = {
  title: 'Receive G$',
}

export default withStyles(({ theme }) => ({
  containerInput: {
    flex: 0,
    marginTop: getDesignRelativeHeight(15),
    marginBottom: 0,
    marginHorizontal: getDesignRelativeHeight(10),
  },
  input: {
    fontSize: normalize(13.5),
    fontFamily: 'Roboto Slab',
  },
  illustration: {
    flexGrow: 1,
    flexShrink: 0,
    maxHeight: getDesignRelativeHeight(230),
    minHeight: getDesignRelativeHeight(140),
    marginTop: getDesignRelativeHeight(15),
    marginBottom: getDesignRelativeHeight(15),
  },
  copyText: {
    marginTop: getDesignRelativeHeight(14),
    marginBottom: getDesignRelativeHeight(20),
  },
}))(ReceiveToAddress)
