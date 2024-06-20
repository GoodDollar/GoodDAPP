import React from 'react'
import { noop } from 'lodash'

import { t } from '@lingui/macro'
import { Image, Text, View } from 'react-native'

import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

import { withStyles } from '../../../lib/styles'
import { WalletV2Continue } from '../../common/buttons/TaskButton'
import WelcomeBilly from '../../../assets/welcome_offer.png'

const mapStylesToProps = ({ theme }) => ({
  container: {
    marginTop: 0,
    marginBottom: 0,
  },
  title: {
    color: theme.colors.lightGdBlue,
    fontSize: 30,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
  innerContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
  imageContainer: {
    paddingVertical: 12,
  },
  image: {
    width: 121,
    height: 91,
  },
  titleContainer: {
    paddingVertical: 12,
  },
  rewardText: {
    color: '#00AEFF',
    fontWeight: 700,
    fontSize: 16,
  },
  rewardContainer: {
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardAmountText: {
    fontSize: 36,
    fontWeight: 800,
    color: '#00AEFF',
  },
  rewardAmountCurrency: {
    fontSize: 24,
    fontWeight: 700,
    color: '#00AEFF',
  },
  description: {
    paddingVertical: 12,
    color: '#525252',
    fontSize: 16,
  },
  descriptionText: {
    paddingVertical: 12,
  },
})

const WelcomeOffer = ({ styles, onDismiss = noop, ...dialogProps }) => (
  <ExplanationDialog
    {...dialogProps}
    title={t`Special Offer: Try the new GoodWallet`}
    titleStyle={styles.title}
    containerStyle={styles.container}
    resizeMode={false}
  >
    <View style={styles.innerContainer}>
      <View style={styles.imageContainer}>
        <Image source={WelcomeBilly} resizeMode={'contain'} style={styles.image} />
      </View>

      <Text style={styles.rewardText}>{`Welcome Reward After First Claim`}</Text>
      <View style={styles.rewardContainer}>
        <Text style={styles.rewardAmountText}>{`200`}</Text>
        <Text style={styles.rewardAmountCurrency}>{`G$`}</Text>
      </View>
      <Text
        style={styles.descriptionText}
      >{`Test out the new GoodWallet! For a limited time, you are eligible for a 200 G$ bonus once you’ve made your first claim in the new GoodWallet.`}</Text>
    </View>
    <View>
      {/* todo: find simplest checkbox solution for react-native */}
      {/* <input type="checkbox" /> */}
      {/* <button> Continue </button> */}
      <WalletV2Continue buttonText="CONTINUE" />
    </View>
  </ExplanationDialog>
)

export default withStyles(mapStylesToProps)(WelcomeOffer)
