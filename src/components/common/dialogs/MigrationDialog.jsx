import React from 'react'
import { noop } from 'lodash'

import { t } from '@lingui/macro'
import { Image, Platform, View } from 'react-native'

import Section from '../layout/Section'

import { openLink } from '../../../lib/utils/linking'
import { withStyles } from '../../../lib/styles'
import { WalletV2Continue } from '../buttons/TaskButton'
import WelcomeBilly from '../../../assets/welcome_offer.png'
import ExplanationDialog from './ExplanationDialog'

const mapStylesToProps = ({ theme }) => ({
  container: {
    marginTop: 0,
    marginBottom: 0,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.lightGdBlue,
    fontSize: 30,
    marginBottom: 0,
    marginTop: 24,
    textAlign: 'center',
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
    paddingVertical: 24,
  },
  image: {
    width: 121,
    height: 91,
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
    textAlign: 'left',
  },
  descriptionText: {
    margin: 0,
    textAlign: 'left',
    alignItems: 'flex-start',
  },
  list: {
    paddingLeft: 10,
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  boldText: {
    fontWeight: '700',
  },
  dismissButton: {
    textAlign: 'center',
    marginTop: 24,
  },
  dismissButtonText: {
    color: '#8499BB',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    textDecorationLine: 'underline',
    ...Platform.select({
      web: {
        textUnderlinePosition: 'under',
      },
    }),
  },
})

const MigrationDialog = ({ styles, onDismiss = noop, ...dialogProps }) => {
  const openFaqLink = () => {
    openLink('https://ubi.gd/4kjBQgD', '_blank')
  }

  const openGoodDapp = () => {
    openLink('https://ubi.gd/4ocVyx1 ', '_blank')
  }

  const openGuide = () => {
    openLink('https://ubi.gd/3UDrtJv', '_blank')
  }

  return (
    <ExplanationDialog
      {...dialogProps}
      title={'You’re being redirected to the New GoodWallet!'}
      titleStyle={styles.title}
      containerStyle={styles.container}
      resizeMode={false}
    >
      <View style={styles.innerContainer}>
        <View style={styles.imageContainer}>
          <Image source={WelcomeBilly} resizeMode={'contain'} style={styles.image} />
        </View>
        <Section.Stack style={styles.descriptionText}>
          <Section.Text style={styles.description}>
            {t`The version of the GoodWallet you’re currently using is`}
            {` `}
            <Section.Text style={styles.boldText}>{t`being replaced with an upgraded experience`}</Section.Text>
            {t`.`}
          </Section.Text>
          <Section.Text style={styles.description}>
            {t`By`}
            {` `}
            <Section.Text style={styles.boldText}>{t`August, 2025`}</Section.Text>
            {t`, everyone will be using the`}
            {` `}
            <Section.Text style={styles.boldText}>{t`New GoodWallet`}</Section.Text>
            {t` - a faster, multi-chain wallet built for the future - as the old version will no longer be supported.`}
          </Section.Text>
          <Section.Text
            style={{ marginTop: 16 }}
            fontSize={16}
            numberOfLines={1}
            textDecorationLine="underline"
            onPress={openFaqLink}
            ellipsizeMode="middle"
            textAlign="left"
          >
            For more on the New GoodWallet, check here.
          </Section.Text>
          <Section.Text style={{ marginTop: 16, color: '#525252', fontSize: 16, textAlign: 'left' }}>
            {t`If you’re a woman in Nigeria or Colombia, you can still qualify for more G$ UBI by `}
            {` `}
            <Section.Text style={{ textDecorationLine: 'underline' }} onPress={openGoodDapp}>
              {t`claiming directly through the GoodDapp.`}
            </Section.Text>
            <Section.Text>
              {` `}
              {t`Guide on how to do it`}
              {` `}
            </Section.Text>
            <Section.Text style={{ textDecorationLine: 'underline' }} onPress={openGuide}>
              {t`here.`}
            </Section.Text>
          </Section.Text>
          <Section.Text style={{ fontStyle: 'italic', marginTop: 32, textAlign: 'left' }}>
            {t`The New GoodWallet is only available using a web browser, so you may be asked to open the link in your preferred browser.`}
          </Section.Text>
        </Section.Stack>
      </View>
      <View style={{ marginTop: 24, marginBottom: 8 }}>
        <WalletV2Continue buttonText={t`TAKE ME TO THE NEW GOODWALLET`} onDismiss={onDismiss} />
      </View>
    </ExplanationDialog>
  )
}

export default withStyles(mapStylesToProps)(MigrationDialog)
