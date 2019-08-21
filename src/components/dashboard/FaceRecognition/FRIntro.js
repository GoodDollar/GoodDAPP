import React from 'react'
import { Image, View } from 'react-native'
import { isIOS, isMobileSafari } from 'mobile-device-detect'
import GDStore from '../../../lib/undux/GDStore'
import Separator from '../../common/layout/Separator'
import logger from '../../../lib/logger/pino-logger'
import { CustomButton, Section, Wrapper } from '../../common'
import { fireEvent } from '../../../lib/analytics/analytics'
import { getFirstWord } from '../../../lib/utils/getFirstWord'
import { withStyles } from '../../../lib/styles'
import illustration from '../../../assets/FaceRecognition/illustration.svg'

Image.prefetch(illustration)

const log = logger.child({ from: 'FRIntro' })
const FRIntro = props => {
  const store = GDStore.useStore()
  const { fullName } = store.get('profile')
  const { styles } = props

  const isUnsupported = isIOS && isMobileSafari === false
  const isValid = props.screenProps.screenState && props.screenProps.screenState.isValid

  log.debug({ isIOS, isMobileSafari })
  if (isUnsupported) {
    props.screenProps.navigateTo('UnsupportedDevice', { reason: 'isNotMobileSafari' })
  }
  if (isValid) {
    props.screenProps.pop({ isValid: true })
  } else {
    fireEvent('FR_Intro')
  }
  const gotoPrivacyArticle = () => props.screenProps.push('PrivacyArticle')
  const gotoFR = () => props.screenProps.navigateTo('FaceVerification')

  return (
    <Wrapper>
      <Section style={styles.topContainer}>
        <View style={styles.mainContent}>
          <Section.Title fontWeight="medium" textTransform="none" style={styles.mainTitle}>
            {`${getFirstWord(fullName)},\nLet's make sure you are\na real live person`}
          </Section.Title>
          <Image source={illustration} resizeMode="contain" style={styles.illustration} />
          <Separator width={2} />
          <Section.Text style={styles.descriptionContainer}>
            <Section.Text fontWeight="bold" color="primary" style={styles.description}>
              Since its your first transaction
            </Section.Text>
            <Section.Text color="primary" style={styles.description}>
              {`we will take a short video of you\nto prevent duplicate accounts.`}
            </Section.Text>
            <Section.Text
              fontWeight="bold"
              textDecoration="underline"
              color="primary"
              style={[styles.description, styles.descriptionUnderline]}
              onPress={gotoPrivacyArticle}
            >
              Learn more
            </Section.Text>
          </Section.Text>
          <Separator style={[styles.bottomSeparator]} width={2} />
        </View>
        <CustomButton style={[styles.button]} onPress={gotoFR}>
          OK, Verify me
        </CustomButton>
      </Section>
    </Wrapper>
  )
}
FRIntro.navigationOptions = {
  navigationBarHidden: false,
  title: 'Face Verification',
}

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.sizes.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 0,
    justifyContent: 'center',
    paddingBottom: theme.sizes.defaultDouble,
    paddingLeft: theme.sizes.default,
    paddingRight: theme.sizes.default,
    paddingTop: theme.sizes.defaultDouble * 2,
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingLeft: theme.sizes.default * 3,
    paddingRight: theme.sizes.default * 3,
    width: '100%',
  },
  mainTitle: {
    marginBottom: 28,
  },
  illustration: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 28,
    maxWidth: '100%',
    minHeight: 151,
    minWidth: 203,
  },
  descriptionContainer: {
    paddingHorizontal: theme.sizes.defaultHalf,
    paddingVertical: theme.sizes.defaultDouble,
  },
  description: {
    display: 'block',
    paddingTop: 0,
  },
  descriptionUnderline: {
    paddingTop: theme.sizes.defaultDouble,
  },
  button: {
    marginTop: 'auto',
    width: '100%',
  },
  bottomSeparator: {
    marginBottom: 28,
  },
})

FRIntro.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default withStyles(getStylesFromProps)(FRIntro)
