import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import get from 'lodash/get'
import { getFirstWord } from '../../../lib/utils/getFirstWord'
import normalize from '../../../lib/utils/normalizeText'
import { CustomButton, Section, Wrapper } from '../../common'
import Separator from '../../common/layout/Separator'
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
    props.screenProps.navigateTo('FaceVerification', { showHelper: false })
  }

  log.debug(props.screenProps)
  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section
          style={{
            flex: 1,
            justifyContent: 'space-evenly',
            marginBottom: 0,
            paddingBottom: 0,
            paddingLeft: 44,
            paddingRight: 44,
            paddingTop: 0,
          }}
        >
          <Section.Title style={styles.mainTitle}> {`${getFirstWord(fullName)},\n${title}`}</Section.Title>
          <Image source={Oops} resizeMode={'center'} style={{ height: 146 }} />
          <Section
            style={{
              paddingBottom: 0,
              paddingTop: 0,
              marginBottom: 0,
            }}
          >
            <Separator width={2} />
            <Section.Text style={styles.description}>
              <Text style={{ fontWeight: 'normal' }}> {`${error}`} </Text>
            </Section.Text>
            <Separator width={2} />
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
    paddingTop: 33,
    borderRadius: 5,
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: 20,
    justifyContent: 'flex-end',
  },
  description: {
    color: '#00AFFF',
    fontFamily: 'Roboto',
    fontSize: normalize(16),
    fontWeight: 'bold',
    paddingBottom: 25,
    paddingTop: 25,
  },
  mainTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: 24,
    color: '#42454A',
    textTransform: 'none',
  },
})

FRError.navigationOptions = {
  title: 'Face Verifcation',
  navigationBarHidden: false,
}
export default FRError
