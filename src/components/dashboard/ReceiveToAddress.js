// @flow

import React from 'react'
import { View } from 'react-native'
import GoodWallet from '../../lib/wallet/GoodWallet'
import InputText from '../common/form/InputText'
import { Section, Text, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import normalize from '../../lib/utils/normalizeText'
import CopyButton from '../common/buttons/CopyButton'
import useOnPress from '../../lib/hooks/useOnPress'

export type TypeProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const { account } = GoodWallet

const warningBoxStyles = ({ theme }) => ({
  warningTextWrapper: {
    borderWidth: 2,
    borderRadius: 5,
    borderStyle: 'solid',
    borderColor: theme.colors.red,
    width: 'auto',
    marginHorizontal: 'auto',
    marginBottom: getDesignRelativeHeight(20),
    paddingVertical: getDesignRelativeHeight(14),
    paddingHorizontal: getDesignRelativeWidth(14),
  },
})

export const GDTokensWarningBox = withStyles(warningBoxStyles)(({ styles, isSend = false }) => (
  <View style={styles.warningTextWrapper}>
    <Text fontSize={13.5} fontFamily="Roboto Slab" letterSpacing={0.14} lineHeight={21} color="red">
      {isSend
        ? `Do not send tokens to Ethereum network addresses.\nYou are on Fuse Network.`
        : `Do not send tokens to Ethereum network to this address.\nThis is a Fuse Network address for G$ tokens only.`}
    </Text>
  </View>
))

const ReceiveToAddress = ({ screenProps, styles, address }: TypeProps) => {
  const onPressDone = useOnPress(screenProps.goToRoot)
  return (
    <Wrapper>
      <TopBar push={screenProps.push} hideProfile={false} profileAsLink={false}>
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
