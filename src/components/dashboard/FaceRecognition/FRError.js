import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { CustomButton, Section, Wrapper } from '../../common'
import Divider from '../../../assets/Dividers - Long Line - Stroke Width 2 - Round Cap - Light Blue.svg'
import SmileyHug from '../../../assets/smileyhug.svg'
import GDStore from '../../../lib/undux/GDStore'
import SimpleStore from '../../../lib/undux/SimpleStore'
import logger from '../../../lib/logger/pino-logger'

const log = logger.child({ from: 'FRError' })

const FRError = props => {
  const store = GDStore.useStore()
  const { fullName } = store.get('profile')

  const isValid = props.screenProps.screenState && props.screenProps.screenState.isValid
  const isError = props.screenProps.screenState && props.screenProps.screenState.error
  let error = 'Unknown Error'

  if (isError) {
    error = props.screenProps.screenState.error
  }
  if (isValid) {
    props.screenProps.pop({ isValid: true })
  }
  const gotoFR = () => {
    props.screenProps.pop({ isValid: true })
    props.screenProps.push('FaceRecognition')
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
            flex: 1
          }}
        >
          <Section.Title style={styles.mainTitle}> {`${fullName},\nSomething went wrong on our side...`}</Section.Title>
          <Image source={SmileyHug} resizeMode={'center'} style={{ height: normalize(152) }} />
          <Section
            style={{
              paddingBottom: 0,
              paddingTop: 0,
              marginBottom: 0
            }}
          >
            <Image source={Divider} style={{ height: normalize(2) }} />
            <Section.Text style={styles.description}>
              <Text style={{ fontWeight: 'normal' }}> {`\n${error}`} </Text>
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
  title: 'Face Verification'
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
    paddingTop: normalize(33)
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
    color: '#00AFFF',
    paddingTop: normalize(25),
    paddingBottom: normalize(25)
  },
  mainTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: normalize(24),
    color: '#42454A',
    textTransform: 'none'
  }
})

export default SimpleStore.withStore(FRError)
