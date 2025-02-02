import React from 'react'
import { noop } from 'lodash'

import { t } from '@lingui/macro'
import { Image, Platform, View } from 'react-native'

import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import Section from '../layout/Section'

import { openLink } from '../../../lib/utils/linking'
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
    marginBottom: 0,
    marginTop: 24,
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

const listItems = [
  'See thousands of cryptocurrencies across dozens of blockchain networks',
  'Claim from all chains at once',
  'Seamlessly send and receive crypto',
]

const WelcomeOffer = ({ styles, onDismiss = noop, ...dialogProps }) => {
  const openFaqLink = () => {
    openLink('https://docs.gooddollar.org/wallet-and-products/new-goodwallet', '_blank')
  }

  return (
    <ExplanationDialog
      {...dialogProps}
      title={'The New \n GoodWallet is here!'}
      titleStyle={styles.title}
      containerStyle={styles.container}
      resizeMode={false}
    >
      <View style={styles.innerContainer}>
        <View style={styles.imageContainer}>
          <Image source={WelcomeBilly} resizeMode={'contain'} style={styles.image} />
        </View>
        <Section.Stack style={styles.descriptionText}>
          <Section.Text style={styles.descriptionText}>{t`The New GoodWallet allows you to:`}</Section.Text>
          {listItems.map(item => (
            <Section.Text key={item} style={[styles.list, { textAlign: 'left' }]}>
              <Section.Text>{`\u2022  `}</Section.Text>
              <Section.Text style={[styles.descriptionText, { marginLeft: 8 }]}>{item}</Section.Text>
            </Section.Text>
          ))}
          <Section.Text
            style={{ marginTop: 16 }}
            fontSize={16}
            numberOfLines={1}
            textDecorationLine="underline"
            onPress={openFaqLink}
            ellipsizeMode="middle"
            textAlign="left"
          >
            For more on the New GoodWallet, check the FAQ here.
          </Section.Text>
          <Section.Text style={{ fontStyle: 'italic', marginTop: 32, textAlign: 'left' }}>
            The New GoodWallet is only available using a web browser, so you may be asked to open the link in your
            preferred browser.
          </Section.Text>
        </Section.Stack>
      </View>
      <View style={{ marginTop: 24, marginBottom: 8 }}>
        <WalletV2Continue buttonText={t`TAKE ME TO THE NEW GOODWALLET`} onDismiss={onDismiss} />
      </View>
    </ExplanationDialog>
  )
}

export default withStyles(mapStylesToProps)(WelcomeOffer)
