// @flow
import React from 'react'
import { Image, View } from 'react-native'
import numeral from 'numeral'
import { WrapperClaim } from '../../common'
import arrowsDown from '../../../assets/arrowsDown.svg'
import Text from '../../common/view/Text'
import Section from '../../common/layout/Section'
import ClaimButton from '../ClaimButton'
const dollarValueGenerate = '$1252,122.25'

Image.prefetch(arrowsDown)

const Claimphase1 = ({ styles, isCitizen, state, handleClaim, faceRecognition }) => {
  return (
    <WrapperClaim>
      <Section style={styles.mainContainer}>
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
              <Text color="#0C263D" fontSize={16} fontWeight={500} ontFamily="Roboto">
                {`Total money generated today:`}
              </Text>
              <Text color="#0C263D" fontSize={30} fontWeight="bold" ontFamily="Roboto">
                {dollarValueGenerate}
              </Text>
            </View>
          </Section.Row>
          <Section.Row alignItems="center" justifyContent="center" style={[styles.row, styles.subMainText]}>
            <Image source={arrowsDown} style={styles.arrowsDown} />
          </Section.Row>
        </Section.Stack>
        <Section.Stack style={styles.btnBlock}>
          <ClaimButton
            isCitizen={isCitizen}
            entitlement={state.entitlement}
            nextClaim={state.nextClaim}
            onPress={() => (isCitizen && state.entitlement ? handleClaim() : !isCitizen && faceRecognition())}
          />
        </Section.Stack>
        <Section.Stack style={styles.moreInfo}>
          <View style={styles.space} />
          <Section.Row style={styles.extraInfoStats}>
            <Text style={styles.extraInfoWrapper}>
              <Section.Text fontWeight="bold">{numeral(state.claimedToday.people).format('0a')} </Section.Text>
              <Section.Text>good people have claimed today!</Section.Text>
            </Text>
          </Section.Row>
        </Section.Stack>
      </Section>
    </WrapperClaim>
  )
}

export default Claimphase1
