import React from 'react'
import { AsyncStorage, StyleSheet, Text, View } from 'react-native'
import normalize from '../../lib/utils/normalizeText'
import { CustomButton, Section, Wrapper } from '../common'
import Separator from '../common/layout/Separator'
import OopsSVG from '../../assets/oops.svg'
import config from '../../config/config'

const InvalidWeb3TokenError = props => {
  AsyncStorage.removeItem('GD_web3Token')

  const ERROR_BOLD = 'Please get back to the web site and try again'
  const TITLE = 'Something went wrong'

  const goToWeb3 = () => {
    window.location = config.web3SiteUrl
  }

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section
          style={{
            paddingBottom: 0,
            paddingTop: 0,
            marginBottom: 0,
            justifyContent: 'space-evenly',
            flex: 1,
          }}
        >
          <Section.Title style={styles.mainTitle}>{TITLE}</Section.Title>
          <View style={{ height: normalize(146) }}>
            <OopsSVG />
          </View>
          <Section
            style={{
              padding: 0,
              marginBottom: 0,
            }}
          >
            <Separator style={{ marginHorizontal: normalize(12) }} width={2} />
            <Section.Text style={styles.description}>
              <Text>{ERROR_BOLD}</Text>
            </Section.Text>
            <Separator style={{ marginHorizontal: normalize(12) }} width={2} />
          </Section>
        </Section>
        <Section>
          <CustomButton onPress={goToWeb3}>{'Ok'}</CustomButton>
        </Section>
      </View>
    </Wrapper>
  )
}

InvalidWeb3TokenError.navigationOptions = {
  navigationBarHidden: false,
  title: 'Invalid Auth Token',
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
    paddingTop: normalize(33),
    borderRadius: 5,
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: normalize(20),
    justifyContent: 'flex-end',
  },
  description: {
    fontSize: normalize(16),
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#00AFFF',
    paddingTop: normalize(25),
    paddingBottom: normalize(25),
  },
  mainTitle: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: normalize(24),
    color: '#42454A',
    textTransform: 'none',
  },
})

export default InvalidWeb3TokenError
