import React, { useState } from 'react'
import { noop } from 'lodash'

import { t } from '@lingui/macro'
import { Image, Text, View } from 'react-native'

import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

import { withStyles } from '../../../lib/styles'
import { WalletV2Continue } from '../../common/buttons/TaskButton'
import WelcomeBilly from '../../../assets/welcome_offer.png'
import CheckBox from '../../common/buttons/CheckBox'

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
    fontWeight: '700',
    fontSize: 16,
  },
  rewardContainer: {
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardAmountText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#00AEFF',
  },
  rewardAmountCurrency: {
    fontSize: 24,
    fontWeight: '700',
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
  boldText: {
    fontWeight: '700',
  },
})

const WelcomeOffer = ({ styles, onDismiss = noop, ...dialogProps }) => {
  const [dontShowAgain, setDontShow] = useState(false)

  return (
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

        <Text style={styles.rewardText}>{t`Welcome Reward After First Claim`}</Text>
        <View style={styles.rewardContainer}>
          <Text style={[styles.rewardAmountText, { fontWeight: 'bold' }]}>{dialogProps.offerAmount}</Text>
          <Text style={styles.rewardAmountCurrency}>{`G$`}</Text>
        </View>
        <Text style={styles.descriptionText}>
          {t`Test out the new GoodWallet! For a limited time, you are eligible for `}{' '}
          <Text style={styles.boldText}>{dialogProps.offerAmount} G$</Text>{' '}
          {t`bonus once you’ve made your first claim in the new GoodWallet. 

Make sure you use the same login method you use here! 
Not sure about your login method? You can see it in your Profile. `}
        </Text>
      </View>
      <View marginBottom={24}>
        <CheckBox onClick={() => setDontShow(prev => !prev)} value={dontShowAgain}>
          <Text style={[styles.descriptionText, { paddingLeft: 8, userSelect: 'none' }]}>
            {t`Dont show this offer again`}
          </Text>
        </CheckBox>
        <WalletV2Continue
          buttonText={t`CONTINUE`}
          dontShowAgain={dontShowAgain}
          onDismiss={onDismiss}
          promoUrl={dialogProps.promoUrl}
        />
      </View>
    </ExplanationDialog>
  )
}

export default withStyles(mapStylesToProps)(WelcomeOffer)
