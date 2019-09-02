import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import get from 'lodash/get'
import { getFirstWord } from '../../../lib/utils/getFirstWord'
import { CustomButton, Section, Wrapper } from '../../common'
import Separator from '../../common/layout/Separator'
import Oops from '../../../assets/oops.svg'
import GDStore from '../../../lib/undux/GDStore'
import logger from '../../../lib/logger/pino-logger'
const log = logger.child({ from: 'FRError' })

Image.prefetch(Oops)
const FRError = props => {
  const store = GDStore.useStore()
  const { fullName } = store.get('profile')

  const isValid = get(props, 'screenProps.screenState.isValid', undefined)

  let reason = get(props, 'screenProps.screenState.error', '')
  if (reason instanceof Error || reason.message) {
    if (reason.name === 'NotAllowedError') {
      reason = `Looks like GoodDollar doesn't have access to your camera. Please provide access and try again`
    } else {
      reason = reason.message
    }
  }

  log.debug({ props, reason })

  //is the error mesage something we want to show to the user? currently only camera related
  const isRelevantError = reason.match(/camera/i) || reason === 'Permission denied'
  let error = isRelevantError
    ? reason
    : "You see, it's not that easy to capture your beauty :)\nSo, let's give it another shot..."
  let title = isRelevantError ? 'Something went wrong...' : 'Something went wrong on our side...'
  if (isValid) {
    props.screenProps.pop({ isValid })
  }

  const gotoFR = () => {
    props.screenProps.navigateTo('FaceVerification', { showHelper: true })
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
          <Section.Title fontWeight="medium" textTransform="none">
            {`${getFirstWord(fullName)},\n${title}`}
          </Section.Title>
          <Image source={Oops} resizeMode={'center'} style={{ height: 146 }} />
          <Section
            style={{
              paddingBottom: 0,
              paddingTop: 0,
              marginBottom: 0,
            }}
          >
            <Separator width={2} />
            <Section.Text color="primary" fontWeight="bold" style={styles.description}>
              {`${error}`}
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
    paddingVertical: 25,
  },
})

FRError.navigationOptions = {
  title: 'Face Verifcation',
  navigationBarHidden: false,
}
export default FRError
