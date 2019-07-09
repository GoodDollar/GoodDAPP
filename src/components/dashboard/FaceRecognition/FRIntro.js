import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { CustomButton, Section, Wrapper } from '../../common'

const FRIntro = props => {
  let fullName = 'John'
  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section
          style={{ paddingLeft: normalize(44), paddingRight: normalize(44), justifyContent: 'space-evenly', flex: 1 }}
        >
          <Section.Title style={styles.mainTitle}>
            {`${fullName},\nLets verify you are a living and unique special human being that you are!`}
          </Section.Title>
          <Section.Text style={styles.description}>
            For GoodDollar to succeed
            <Text style={{ fontWeight: 'normal' }}>
              {`\nwe need to make sure every person in our community registered only once for UBI. No BOTS allowed!`}
            </Text>
          </Section.Text>
        </Section>
        <Section>
          <CustomButton>Face CAPTCHA Verification</CustomButton>
        </Section>
      </View>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  topContainer: {
    display: 'flex',
    backgroundColor: 'white',
    height: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    justifyContent: 'space-evenly',
    paddingTop: normalize(30)
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: normalize(20),
    justifyContent: 'flex-end'
  },
  description: {
    fontSize: normalize(16),
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#00AFFF'
  },
  mainTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: normalize(24),
    color: '#42454A',
    textTransform: 'none'
  }
})

export default FRIntro
