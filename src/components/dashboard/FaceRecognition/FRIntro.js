import React from 'react'
import { Image, View } from 'react-native'
import { isIOS, isMobileSafari } from 'mobile-device-detect'
import GDStore from '../../../lib/undux/GDStore'
import Separator from '../../common/layout/Separator'
import logger from '../../../lib/logger/pino-logger'
import normalize from '../../../lib/utils/normalizeText'
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
  const gotoPrivacyArticle = () => props.screenProps.push('PP')
  const gotoFR = () => props.screenProps.navigateTo('FaceVerification')

  return (
    <Wrapper>
      <Section style={styles.topContainer}>
        <View style={styles.mainContent}>
          <Section.Title style={styles.mainTitle}>
            {`${getFirstWord(fullName)},\nLet's verify it's really you`}
          </Section.Title>
          <Image source={illustration} resizeMode="contain" style={[styles.illustration]} />
          <Separator width={2} />
          <Section.Text style={[styles.descriptionContainer]}>
            <Section.Text style={[styles.description, styles.descriptionBold]}>
              Since its your first time claiming G${' '}
            </Section.Text>
            <Section.Text style={[styles.description]}>
              we need to make sure it&apos;s really you and prevent duplicate accounts. After all, we&apos;re give here
              free G$. Learn more about our{' '}
            </Section.Text>
            <Section.Text
              style={[styles.description, styles.descriptionBold, styles.descriptionUnderline]}
              onPress={gotoPrivacyArticle}
            >
              privacy policy
            </Section.Text>
          </Section.Text>
          <Separator style={[styles.bottomSeparator]} width={2} />
        </View>
        <CustomButton style={[styles.button]} onPress={gotoFR}>
          Face Liveness Test
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
    paddingLeft: theme.sizes.defaultDouble,
    paddingRight: theme.sizes.defaultDouble,
  },
  mainTitle: {
    color: theme.colors.darkGray,
    fontFamily: theme.fonts.default,
    fontSize: normalize(24),
    fontWeight: '500',
    marginBottom: 28,
    textTransform: 'none',
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
    paddingBottom: theme.sizes.defaultDouble,
    paddingLeft: theme.sizes.defaultHalf,
    paddingRight: theme.sizes.defaultHalf,
    paddingTop: theme.sizes.defaultDouble,
  },
  description: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.default,
    fontSize: normalize(16),
    fontWeight: '400',
    lineHeight: normalize(20),
  },
  descriptionBold: {
    fontFamily: theme.fonts.default,
    fontWeight: '700',
  },
  descriptionUnderline: {
    textDecoration: 'underline',
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
