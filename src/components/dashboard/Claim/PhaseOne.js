// @flow
import React from 'react'
import { View } from 'react-native'
import numeral from 'numeral'

import Section from '../../common/layout/Section'
import BigGoodDollar from '../../common/view/BigGoodDollar'

import { weiToGd } from '../../../lib/wallet/utils'
import { openLink } from '../../../lib/utils/linking'
import ButtonBlock from './ButtonBlock'

// eslint-disable-next-line require-await
const openLearnMoreLink = async () => openLink('https://w3.gooddollar.org/learn/ubi')

const ClaimPhaseZero = ({
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
      <Section.Text color="surface" fontFamily="slab" fontWeight="bold" fontSize={40} style={styles.headerText}>
        {entitlement ? `Claim Your\nDaily Share` : `Just a Few More\nHours To Go...`}
      </Section.Text>
      {entitlement > 0 ? (
        <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
          <View style={styles.amountBlock}>
            <Section.Text
              color="#0C263D"
              fontSize={55}
              style={styles.amountBlockTitle}
              fontWeight="bold"
              fontFamily="Roboto"
            >
              <BigGoodDollar
                reverse={true}
                number={entitlement}
                formatter={weiToGd}
                fontFamily="Roboto"
                bigNumberProps={{
                  fontFamily: 'Roboto',
                  fontSize: 44,
                  color: theme.colors.darkBlue,
                  fontWeight: 'bold',
                  lineHeight: 36,
                }}
                bigNumberUnitProps={{
                  fontFamily: 'Roboto',
                  fontSize: 42,
                  color: theme.colors.darkBlue,
                  fontWeight: 'medium',
                  lineHeight: 20,
                }}
              />
            </Section.Text>
          </View>
        </Section.Row>
      ) : null}
    </View>
    <Section.Stack style={styles.mainText}>
      <Section.Text>
        <Section.Text color="surface" fontFamily="Roboto" fontSize={18}>
          {`GoodDollar is the world’s first experiment\nto create a framework to generate\nUBI on a global scale.\n`}
          <Section.Text
            color="surface"
            style={styles.learnMoreLink}
            textDecorationLine="underline"
            fontSize={18}
            fontWeight="bold"
            fontFamily="slab"
            onPress={openLearnMoreLink}
          >
            {'Learn More'}
          </Section.Text>
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
      <Section.Text style={styles.extraInfoSecondContainer} fontWeight="bold" fontFamily="Roboto">
        <Section.Text fontSize={16}>{`Today \n`}</Section.Text>
        <Section.Text fontWeight="bold" fontSize={16}>
          <BigGoodDollar
            style={styles.extraInfoAmountDisplay}
            reverse
            number={amount}
            spaceBetween={false}
            formatter={weiToGd}
            fontFamily="Roboto"
            bigNumberProps={{
              fontFamily: 'Roboto',
              fontSize: 17,
              color: 'black',
            }}
            bigNumberUnitProps={{
              fontFamily: 'Roboto',
              fontSize: 16,
              color: 'black',
            }}
          />
        </Section.Text>
        <Section.Text fontSize={16}>{`Claimed by `}</Section.Text>
        <Section.Text fontWeight="bold" color="black" fontSize={16}>
          {numeral(people).format('0a')}{' '}
        </Section.Text>
        <Section.Text fontSize={16}>{`Good People`}</Section.Text>
      </Section.Text>
    </Section.Row>
  </Section.Stack>
)

export default ClaimPhaseZero
