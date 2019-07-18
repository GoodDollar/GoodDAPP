import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import get from 'lodash/get'
import { CustomButton, Section, Wrapper } from '../../common'
import Divider from '../../../assets/Dividers - Long Line - Stroke Width 2 - Round Cap - Light Blue.svg'
import Oops from '../../../assets/oops.svg'
import GDStore from '../../../lib/undux/GDStore'
import logger from '../../../lib/logger/pino-logger'
const log = logger.child({ from: 'FRError' })

const FRError = props => {
  const store = GDStore.useStore()
  const { fullName } = store.get('profile')

  const isValid = get(props, 'screenProps.screenState.isValid', undefined)

  let reason = get(props, 'screenProps.screenState.error', '')
  if (reason instanceof Error) {
    reason = reason.message
  }
  log.debug({ props, reason })

  //is the error mesage something we want to show to the user? currently only camera related
  const isRelevantError = reason.match(/camera/i)
  let error = isRelevantError
    ? reason
    : "You see, it's not that easy to capture your beauty :)\nSo, let's give it another shot..."
  let title = isRelevantError ? 'Something went wrong...' : 'Something went wrong on our side...'
  if (isValid) {
    props.screenProps.pop({ isValid })
  }

  const gotoFR = () => {
    props.screenProps.navigateTo('FaceVerification')
  }

  log.debug(props.screenProps)
  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section
          style={{
            paddingBottom: 0,
            paddingTop: 0,
            marginBottom: 0,
            paddingLeft: normalize(44),
            paddingRight: normalize(44),
            justifyContent: 'space-evenly',
            flex: 1,
          }}
        >
          <Section.Title style={styles.mainTitle}> {`${fullName},\n${title}`}</Section.Title>
          <Image source={Oops} resizeMode={'center'} style={{ height: normalize(146) }} />
          <Section
            style={{
              paddingBottom: 0,
              paddingTop: 0,
              marginBottom: 0,
            }}
          >
            <Image source={Divider} style={{ height: normalize(2) }} />
            <Section.Text style={styles.description}>
              <Text style={{ fontWeight: 'normal' }}> {`${error}`} </Text>
            </Section.Text>
            <Image source={Divider} style={{ height: normalize(2) }} />
          </Section>
        </Section>
        <Section>
          <CustomButton onPress={gotoFR}>PLEASE TRY AGAIN</CustomButton>
        </Section>
      </View>
    </Wrapper>
  )
}
FRError.navigationOptions = {
  navigationBarHidden: false,
  title: 'Face Verification',
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
    verticalAlign: 'text-top',
  },
  mainTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: normalize(24),
    color: '#42454A',
    textTransform: 'none',
  },
})

FRError.navigationOptions = {
  title: 'Face Verifcation',
  navigationBarHidden: false,
}
export default FRError
