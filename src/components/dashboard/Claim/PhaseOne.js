// @flow
import React from 'react'
import { Image, View } from 'react-native'

import numeral from 'numeral'

import Text from '../../common/view/Text'
import Section from '../../common/layout/Section'
import BigGoodDollar from '../../common/view/BigGoodDollar'

import { weiToGd } from '../../../lib/wallet/utils'

import arrowsDown from '../../../assets/arrowsDown.svg'
import ButtonBlock from './ButtonBlock'

Image.prefetch(arrowsDown)

const ClaimPhaseOne = ({
  handleClaim,
  faceRecognition,
  styles,
  isCitizen,
  entitlement,
  nextClaim,
  claimedToday: { amount, people },
}) => (
  <>
    <Section.Stack style={styles.mainText}>
      <View style={styles.mainTextBorder}>
        <Section.Text>
          <Section.Text color="surface" fontFamily="slab" fontWeight="bold" fontSize={40}>
            {`Universal\n`}
          </Section.Text>
          <Section.Text color="surface" fontFamily="slab" fontWeight="bold" fontSize={40}>
            {`Basic Income\nFor All`}
          </Section.Text>
        </Section.Text>
      </View>
      <Section.Row alignItems="center" justifyContent="center" style={[styles.row, styles.subMainText]}>
        <View style={styles.bottomContainer}>
          <Text color="#0C263D" fontSize={16} fontWeight={500} fontFamily="Roboto">
            {`Total money generated today:`}
          </Text>
          <Text color="#0C263D" fontSize={30} fontWeight="bold" fontFamily="Roboto">
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
          </Text>
        </View>
      </Section.Row>
      <Section.Row alignItems="center" justifyContent="center" style={[styles.row, styles.subMainText]}>
        <Image source={arrowsDown} style={styles.arrowsDown} />
      </Section.Row>
    </Section.Stack>
    <ButtonBlock
      styles={styles}
      entitlement={entitlement}
      isCitizen={isCitizen}
      nextClaim={nextClaim}
      handleClaim={handleClaim}
      faceRecognition={faceRecognition}
    />
    <Section.Stack style={styles.moreInfo}>
      <View style={styles.space} />
      <Section.Row style={styles.extraInfoStats}>
        <Text style={styles.extraInfoWrapper}>
          <Section.Text fontWeight="bold">{numeral(people).format('0a')} </Section.Text>
          <Section.Text>good people have claimed today!</Section.Text>
        </Text>
      </Section.Row>
    </Section.Stack>
  </>
)

export default ClaimPhaseOne
