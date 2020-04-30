// @flow
import React from 'react'
import { View } from 'react-native'
import numeral from 'numeral'

import Section from '../../common/layout/Section'
import BigGoodDollar from '../../common/view/BigGoodDollar'

import { weiToGd } from '../../../lib/wallet/utils'
import { openLink } from '../../../lib/utils/linking'
import { isSmallDevice } from '../../../lib/utils/mobileSizeDetect'
import Config from '../../../config/config'
import ButtonBlock from './ButtonBlock'

// eslint-disable-next-line require-await
const openLearnMoreLink = async () => openLink(Config.learnMoreEconomyUrl)

const bigFontSize = isSmallDevice ? 30 : 40
const regularFontSize = isSmallDevice ? 14 : 16

const ClaimPhaseOne = ({
  handleClaim,
  faceRecognition,
  styles,
  isCitizen,
  entitlement,
  nextClaim,
  theme,
  claimedToday: { amount, people },
}) => (
  <Section.Stack style={styles.mainContainer}>
    <View style={styles.headerContentContainer}>
      <Section.Text color="surface" fontFamily="slab" fontWeight="bold" style={styles.headerText}>
        {entitlement ? `Claim Your\nDaily Share` : `Just a Few More\nHours To Go...`}
      </Section.Text>
      {entitlement > 0 ? (
        <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
          <View style={styles.amountBlock}>
            <Section.Text color="#0C263D" style={styles.amountBlockTitle} fontWeight="bold" fontFamily="Roboto">
              <BigGoodDollar
                reverse
                number={entitlement}
                formatter={weiToGd}
                fontFamily="Roboto"
                bigNumberProps={{
                  fontFamily: 'Roboto',
                  fontSize: bigFontSize,
                  color: theme.colors.darkBlue,
                  fontWeight: 'bold',
                  lineHeight: bigFontSize,
                }}
                bigNumberUnitProps={{
                  fontFamily: 'Roboto',
                  fontSize: bigFontSize,
                  color: theme.colors.darkBlue,
                  fontWeight: 'medium',
                  lineHeight: bigFontSize,
                }}
              />
            </Section.Text>
          </View>
        </Section.Row>
      ) : null}
    </View>
    <Section.Stack style={styles.mainText}>
      <Section.Text color="surface" fontFamily="Roboto" style={styles.mainTextSecondContainer}>
        {`GoodDollar is the world’s first experiment\nto create a framework to generate\nUBI on a global scale.\n`}
        <Section.Text
          color="surface"
          style={styles.learnMoreLink}
          textDecorationLine="underline"
          fontWeight="bold"
          fontFamily="slab"
          onPress={openLearnMoreLink}
        >
          {'Learn More'}
        </Section.Text>
      </Section.Text>
    </Section.Stack>
    <ButtonBlock
      styles={styles}
      entitlement={entitlement}
      isCitizen={isCitizen}
      nextClaim={nextClaim}
      handleClaim={handleClaim}
      faceRecognition={faceRecognition}
      showLabelOnly
    />
    <Section.Row style={styles.extraInfoContainer}>
      <Section.Text style={styles.fontSize16} fontWeight="bold" fontFamily="Roboto">
        <Section.Text style={styles.fontSize16}>Today {isSmallDevice === false && `\n`}</Section.Text>
        <Section.Text fontWeight="bold" style={styles.fontSize16}>
          <BigGoodDollar
            style={styles.extraInfoAmountDisplay}
            reverse
            number={amount}
            spaceBetween={false}
            formatter={weiToGd}
            fontFamily="Roboto"
            bigNumberProps={{
              fontFamily: 'Roboto',
              fontSize: regularFontSize,
              color: 'black',
            }}
            bigNumberUnitProps={{
              fontFamily: 'Roboto',
              fontSize: regularFontSize,
              color: 'black',
            }}
          />
        </Section.Text>
        <Section.Text style={styles.fontSize16}>{`Claimed by `}</Section.Text>
        <Section.Text fontWeight="bold" color="black" style={styles.fontSize16}>
          {numeral(people).format('0a')}{' '}
        </Section.Text>
        <Section.Text style={styles.fontSize16}>{`Good People`}</Section.Text>
      </Section.Text>
    </Section.Row>
  </Section.Stack>
)

export default ClaimPhaseOne
