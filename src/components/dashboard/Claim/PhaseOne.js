// @flow
import React from 'react'
import { View } from 'react-native'
import numeral from 'numeral'

import Section from '../../common/layout/Section'
import Text from '../../common/view/Text'
import BigGoodDollar from '../../common/view/BigGoodDollar'

import { weiToGd } from '../../../lib/wallet/utils'
import { openLink } from '../../../lib/utils/linking'
import { getScreenWidth } from '../../../lib/utils/Orientation'
import ButtonBlock from './ButtonBlock'

// eslint-disable-next-line require-await
const openLearnMoreLink = async () => openLink('https://w3.gooddollar.org/learn/ubi')

const calcFontSize = fontSize => {
  const originalWidth = getScreenWidth()
  if (originalWidth < 350) {
    fontSize = fontSize / 1.3
  }

  return fontSize
}

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
  <>
    <View style={styles.mainTextBorder}>
      <Section.Text>
        <Section.Text color="surface" fontFamily="slab" fontWeight="bold" fontSize={calcFontSize(40)}>
          {entitlement ? `Claim Your\nDaily Share` : `Just a Few More\nHours To Go...`}
        </Section.Text>
      </Section.Text>
    </View>
    <Section.Stack style={styles.mainText}>
      {entitlement > 0 ? (
        <Section.Row alignItems="center" justifyContent="center" style={[styles.row]}>
          <View style={styles.amountBlock}>
            <Text
              color="#0C263D"
              fontSize={calcFontSize(55)}
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
                  fontSize: calcFontSize(44),
                  color: theme.colors.darkBlue,
                  fontWeight: 'bold',
                  lineHeight: 36,
                }}
                bigNumberUnitProps={{
                  fontFamily: 'Roboto',
                  fontSize: calcFontSize(42),
                  color: theme.colors.darkBlue,
                  fontWeight: 'medium',
                  lineHeight: 20,
                }}
              />
            </Text>
          </View>
        </Section.Row>
      ) : null}
      <View>
        <Section.Text style={styles.secondTextBlock}>
          <Section.Text color="surface" fontFamily="Roboto" fontSize={calcFontSize(18)}>
            {`GoodDollar is the world’s first experiment\nto create a framework to generate\nUBI on a global scale.\n`}
            <Text
              color="surface"
              style={styles.learnMoreLink}
              textDecorationLine="underline"
              fontSize={calcFontSize(18)}
              fontWeight="bold"
              fontFamily="slab"
              onPress={openLearnMoreLink}
            >
              {'Learn More'}
            </Text>
          </Section.Text>
        </Section.Text>
      </View>
    </Section.Stack>
    <ButtonBlock
      styles={styles}
      entitlement={entitlement}
      isCitizen={isCitizen}
      nextClaim={nextClaim}
      handleClaim={handleClaim}
      faceRecognition={faceRecognition}
      showLabelOnly={true}
    />
    <Section.Row style={styles.extraInfoStats}>
      <Text style={styles.extraInfoWrapper} fontWeight="bold" fontFamily="Roboto">
        <Section.Text fontSize={calcFontSize(16)}>{`Today, `}</Section.Text>
        <Section.Text fontWeight="bold" fontSize={calcFontSize(16)}>
          <BigGoodDollar
            style={{ display: 'contents' }}
            reverse={true}
            number={amount}
            spaceBetween={false}
            formatter={weiToGd}
            fontFamily="Roboto"
            bigNumberProps={{
              fontFamily: 'Roboto',
              fontSize: calcFontSize(17),
              color: 'black',
            }}
            bigNumberUnitProps={{
              fontFamily: 'Roboto',
              fontSize: calcFontSize(16),
              color: 'black',
            }}
          />
        </Section.Text>
        <Section.Text fontSize={calcFontSize(16)}>{`Claimed by `}</Section.Text>
        <Section.Text fontWeight="bold" color="black" fontSize={calcFontSize(16)}>
          {numeral(people).format('0a')}{' '}
        </Section.Text>
        <Section.Text fontSize={calcFontSize(16)}>{`Good People`}</Section.Text>
      </Text>
    </Section.Row>
  </>
)

export default ClaimPhaseZero
