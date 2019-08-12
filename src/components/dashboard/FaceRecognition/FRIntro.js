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
  const gotoPrivacyArticle = () => props.screenProps.push('PP')
  const gotoFR = () => props.screenProps.navigateTo('FaceVerification')

  return (
    <Wrapper>
      <Section style={styles.topContainer} grow={1} justifyContent="center">
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
              we need to make sure it&apos;s really you and prevent duplicate accounts. After all, we&apos;re give here
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
    flexShrink: 0,
    paddingBottom: `${theme.sizes.defaultDouble / 16}rem`,
    paddingLeft: `${theme.sizes.default / 16}rem`,
    paddingRight: `${theme.sizes.default / 16}rem`,
    paddingTop: `${theme.sizes.defaultDouble / 8}rem`,
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingLeft: `${theme.sizes.defaultDouble / 16}rem`,
    paddingRight: `${theme.sizes.defaultDouble / 16}rem`,
  },
  mainTitle: {
    color: theme.colors.darkGray,
    fontFamily: theme.fonts.default,
    fontSize: '1.5rem',
    fontWeight: '500',
    marginBottom: '1.75rem',
    textTransform: 'none',
  },
  illustration: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: '1.75rem',
    maxWidth: '100%',
    minHeight: 151,
    minWidth: 203,
  },
  descriptionContainer: {
    paddingBottom: `${theme.sizes.defaultDouble / 16}rem`,
    paddingLeft: `${theme.sizes.defaultHalf / 16}rem`,
    paddingRight: `${theme.sizes.defaultHalf / 16}rem`,
    paddingTop: `${theme.sizes.defaultDouble / 16}rem`,
  },
  description: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.default,
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.25rem',
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
    marginBottom: '1.75rem',
  },
})

FRIntro.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default withStyles(getStylesFromProps)(FRIntro)
