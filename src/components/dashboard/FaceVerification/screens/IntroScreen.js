import React, { useEffect } from 'react'
import { View } from 'react-native'
import { isIOSWeb as isIOS, isMobileSafari } from '../../../../lib/utils/platform'
import GDStore from '../../../../lib/undux/GDStore'
import Separator from '../../../common/layout/Separator'
import logger from '../../../../lib/logger/pino-logger'
import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'
import { fireEvent } from '../../../../lib/analytics/analytics'
import { getFirstWord } from '../../../../lib/utils/getFirstWord'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import { withStyles } from '../../../../lib/styles'
import FaceVerificationSmiley from '../../../common/animations/FaceVerificationSmiley'

const log = logger.child({ from: 'FaceVerificationIntro' })

const IntroScreen = props => {
  const store = GDStore.useStore()
  const { fullName } = store.get('profile')
  const { styles } = props

  const isUnsupported = isIOS && isMobileSafari === false
  const isValid = props.screenProps.screenState && props.screenProps.screenState.isValid
  log.debug({ isIOS, isMobileSafari })

  if (isUnsupported) {
    props.screenProps.navigateTo('FaceVerificationUnsupported', { reason: 'isNotMobileSafari' })
  }

  useEffect(() => {
    if (isValid) {
      props.screenProps.pop({ isValid: true })
    } else {
      fireEvent('FR_Intro')
    }
  }, [isValid])

  const gotoPrivacyArticle = () => props.screenProps.push('PrivacyArticle')
  const gotoFR = () => props.screenProps.navigateTo('FaceVerification')

  return (
    <Wrapper>
      <Section style={styles.topContainer} grow={1} justifyContent="center">
        <View style={styles.mainContent}>
          <Section.Title fontWeight="medium" textTransform="none" style={styles.mainTitle}>
            {`${getFirstWord(fullName)},\nLet's make sure you are a real live person`}
          </Section.Title>
          <FaceVerificationSmiley />
          <View>
            <Separator width={2} />
            <Text textAlign="center" style={styles.descriptionContainer}>
              <Text textAlign="center" fontWeight="bold" color="primary">
                {`Since this is your first G$ Claim\n`}
              </Text>
              <Text textAlign="center" color="primary">
                {`we will take a short video of you\n`}
              </Text>
              <Text textAlign="center" color="primary">
                {`to prevent duplicate accounts.\n`}
              </Text>
              <Text
                textAlign="center"
                fontWeight="bold"
                textDecorationLine="underline"
                color="primary"
                style={styles.descriptionUnderline}
                onPress={gotoPrivacyArticle}
              >
                {`Learn more`}
              </Text>
            </Text>
            <Separator style={[styles.bottomSeparator]} width={2} />
          </View>
          <CustomButton style={[styles.button]} onPress={gotoFR}>
            OK, Verify me
          </CustomButton>
        </View>
      </Section>
    </Wrapper>
  )
}

IntroScreen.navigationOptions = {
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
    paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.default),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingLeft: getDesignRelativeWidth(theme.sizes.default * 3),
    paddingRight: getDesignRelativeWidth(theme.sizes.default * 3),
    width: '100%',
  },
  mainTitle: {
    marginBottom: getDesignRelativeHeight(28),
  },
  illustration: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: getDesignRelativeHeight(28),
    maxWidth: '100%',
    height: getDesignRelativeHeight(145),
  },
  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(theme.sizes.defaultDouble),
  },
  descriptionUnderline: {
    display: 'block',
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultQuadruple),
  },
  button: {
    width: '100%',
  },
  bottomSeparator: {
    marginBottom: getDesignRelativeHeight(28),
  },
})

export default withStyles(getStylesFromProps)(IntroScreen)
