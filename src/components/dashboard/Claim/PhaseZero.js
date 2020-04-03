// @flow
import React from 'react'
import { View } from 'react-native'
import numeral from 'numeral'

import Section from '../../common/layout/Section'
import { WrapperClaim } from '../../common'
import Text from '../../common/view/Text'
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
  claimedToday: { amount, people },
}) => (
  <WrapperClaim>
    <Section style={styles.mainContainer}>
      <Section.Stack style={styles.mainText}>
        <View style={styles.mainTextBorder}>
          <Section.Text>
            <Section.Text color="surface" fontFamily="slab" fontWeight="bold" fontSize={40}>
              {entitlement ? `Claim Your\nDaily Share` : `Just a Few More\nHours To Go...`}
            </Section.Text>
          </Section.Text>
        </View>
        {entitlement > 0 ? (
          <Section.Row alignItems="center" justifyContent="center" style={[styles.row, styles.subMainText]}>
            <View style={styles.amountBlock}>
              <Text color="#0C263D" fontSize={55} fontWeight="bold" fontFamily="Roboto">
                <BigGoodDollar
                  reverse={true}
                  number={entitlement}
                  formatter={weiToGd}
                  fontFamily="Roboto"
                  bigNumberProps={{
                    fontFamily: 'Roboto',
                    fontSize: 50,
                    color: 'black',
                    fontWeight: 'bold',
                    lineHeight: 36,
                  }}
                  bigNumberUnitProps={{
                    fontFamily: 'Roboto',
                    fontSize: 45,
                    color: 'black',
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
            <Section.Text color="surface" fontFamily="slab" fontSize={18}>
              {`GoodDollar is the world’s first experiment\nto create a framework to generate\nUBI on a global scale.\n`}
              <Text
                color="surface"
                style={styles.learnMoreLink}
                textDecorationLine="underline"
                fontSize={18}
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
        showLabelOnly
      />
      <Section.Stack style={styles.moreInfo}>
        <View style={styles.space} />
        <Section.Row style={styles.extraInfoStats}>
          <Text style={styles.extraInfoWrapper} fontSize={16} fontWeight="bold" fontFamily="Roboto">
            <Section.Text>{`Today\n `}</Section.Text>
            <Section.Text fontWeight="bold">
              <BigGoodDollar
                style={{ display: 'contents' }}
                reverse={true}
                number={amount}
                formatter={weiToGd}
                fontFamily="Roboto"
                bigNumberProps={{
                  fontFamily: 'Roboto',
                  fontSize: 16,
                  color: 'black',
                }}
                bigNumberUnitProps={{
                  fontFamily: 'Roboto',
                  fontSize: 18,
                  color: 'black',
                }}
              />
            </Section.Text>
            <Section.Text>{` Claimed by `}</Section.Text>
            <Section.Text fontWeight="bold" color="black">
              {numeral(people).format('0a')}{' '}
            </Section.Text>
            <Section.Text>{` Good People`}</Section.Text>
          </Text>
        </Section.Row>
      </Section.Stack>
    </Section>
  </WrapperClaim>
)

export default ClaimPhaseZero
