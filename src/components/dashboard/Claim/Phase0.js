// @flow
import React from 'react'
import { View } from 'react-native'
import numeral from 'numeral'

import { weiToGd } from '../../../lib/wallet/utils'
import { WrapperClaim } from '../../common'
import BigGoodDollar from '../../common/view/BigGoodDollar'
import Text from '../../common/view/Text'

import Section from '../../common/layout/Section'
import ClaimButton from '../ClaimButton'

const Claimphase0 = ({ styles, isCitizen, entitlement, state, handleClaim, faceRecognition }) => {
  return (
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
                <Text color="surface" textDecorationLine="underline" fontSize={18} fontWeight="bold" fontFamily="slab">
                  {'Learn More'}
                </Text>
              </Section.Text>
            </Section.Text>
          </View>
        </Section.Stack>
        <Section.Stack style={styles.btnBlock}>
          <ClaimButton
            isCitizen={isCitizen}
            entitlement={entitlement}
            nextClaim={state.nextClaim}
            onPress={() => (isCitizen && entitlement ? handleClaim() : !isCitizen && faceRecognition())}
          />
        </Section.Stack>
        <Section.Stack style={styles.moreInfo}>
          <View style={styles.space} />
          <Section.Row style={styles.extraInfoStats}>
            <Text style={styles.extraInfoWrapper} fontSize={16} fontWeight="bold" fontFamily="Roboto">
              <Section.Text>{`Today\n `}</Section.Text>
              <Section.Text fontWeight="bold">
                <BigGoodDollar
                  style={{ display: 'contents' }}
                  reverse={true}
                  number={state.claimedToday.amount}
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
                {numeral(state.claimedToday.people).format('0a')}{' '}
              </Section.Text>
              <Section.Text>{` Good People`}</Section.Text>
            </Text>
          </Section.Row>
        </Section.Stack>
      </Section>
    </WrapperClaim>
  )
}

export default Claimphase0
