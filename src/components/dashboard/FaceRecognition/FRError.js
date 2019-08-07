import React from 'react'
import { Image, Text, View } from 'react-native'
import get from 'lodash/get'
import { getFirstWord } from '../../../lib/utils/getFirstWord'
import { CustomButton, Section, Wrapper } from '../../common'
import Separator from '../../common/layout/Separator'
import Oops from '../../../assets/oops.svg'
import GDStore from '../../../lib/undux/GDStore'
import logger from '../../../lib/logger/pino-logger'
import { withStyles } from '../../../lib/styles'

const log = logger.child({ from: 'FRError' })

const FRError = props => {
  const { styles } = props
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
    : "You see, it's not that easy\n to capture your beauty :)\nSo, let's give it another shot..."
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
        <Section style={styles.descriptionContainer}>
          <Section.Title style={styles.mainTitle}> {`${getFirstWord(fullName)},\n${title}`}</Section.Title>
          <Image source={Oops} resizeMode={'center'} style={styles.errorImage} />
          <Section style={styles.errorSection}>
            <Separator width={2} />
            <Section.Text style={styles.description}>
              <Text style={styles.errorText}> {`${error}`} </Text>
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

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    display: 'flex',
    backgroundColor: theme.colors.surface,
    height: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    justifyContent: 'space-evenly',
    paddingBottom: `${theme.sizes.defaultDouble / 16}rem`,
    paddingLeft: `${theme.sizes.default / 16}rem`,
    paddingRight: `${theme.sizes.default / 16}rem`,
    paddingTop: `${theme.sizes.defaultDouble / 8}rem`,
    borderRadius: 5,
  },
  errorImage: {
    height: 146,
  },
  errorText: {
    fontWeight: 'normal',
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    marginBottom: 0,
    paddingBottom: `${theme.sizes.defaultDouble / 16}rem`,
    paddingLeft: `${theme.sizes.defaultHalf / 16}rem`,
    paddingRight: `${theme.sizes.defaultHalf / 16}rem`,
    paddingTop: `${theme.sizes.defaultDouble / 16}rem`,
  },
  errorSection: {
    paddingBottom: 0,
    paddingTop: 0,
    marginBottom: 0,
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: '1.25rem',
    justifyContent: 'flex-end',
  },
  description: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.default,
    fontSize: '1rem',
    fontWeight: 'bold',
    paddingBottom: '1.57rem',
    paddingTop: '1.57rem',
    lineHeight: '1.25rem',
  },
  mainTitle: {
    fontFamily: theme.fonts.medium,
    fontSize: '1.5rem',
    color: theme.colors.darkGray,
    textTransform: 'none',
  },
})

FRError.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default withStyles(getStylesFromProps)(FRError)
