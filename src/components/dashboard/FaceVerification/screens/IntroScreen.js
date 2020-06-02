import React, { useEffect } from 'react'
import { View } from 'react-native'
import { isIOS, isMobileSafari } from 'mobile-device-detect'
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
import { isBrowser } from '../../../../lib/utils/platform'
import { openLink } from '../../../../lib/utils/linking'
import useOnPress from '../../../../lib/hooks/useOnPress'
import Config from '../../../../config/config'

const log = logger.child({ from: 'FaceVerificationIntro' })

const IntroScreen = ({ styles, screenProps }) => {
  const store = GDStore.useStore()
  const { fullName } = store.get('profile')

  const isValid = screenProps.screenState && screenProps.screenState.isValid
  log.debug({ isIOS, isMobileSafari })

  useEffect(() => {
    if (isValid) {
      screenProps.pop({ isValid: true })
    } else {
      fireEvent('FR_Intro')
    }
  }, [isValid])

  const openPrivacy = useOnPress(() => openLink(Config.faceVerificationPrivacyUrl), [])
  const gotoFR = useOnPress(() => screenProps.navigateTo('FaceVerification'), [screenProps])

  return (
    <Wrapper>
      <Section style={styles.topContainer} grow>
        <View style={styles.mainContent}>
          <Section.Title fontWeight="medium" textTransform="none" style={styles.mainTitle}>
            {`${getFirstWord(fullName)},\nLet's make sure you're\na real live person`}
          </Section.Title>
          <View style={styles.illustration}>
            <FaceVerificationSmiley />
          </View>
          <View>
            <Separator width={2} />
            <Text textAlign="center" style={styles.descriptionContainer}>
              <Text textAlign="center" fontWeight="bold" color="primary">
                {`Once in a while\n`}
              </Text>
              <Text textAlign="center" color="primary">
                {`we'll need to take a short video of you\n`}
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
                onPress={openPrivacy}
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
    justifyContent: 'center',
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
    marginTop: getDesignRelativeHeight(isBrowser ? 30 : 15),
  },
  illustration: {
    marginTop: getDesignRelativeHeight(18),
    marginBottom: getDesignRelativeHeight(18),
    height: getDesignRelativeWidth(isBrowser ? 220 : 130),
    width: '100%',
  },
  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : 14),
  },
  descriptionUnderline: {
    display: 'block',
    paddingTop: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultQuadruple : theme.sizes.defaultDouble),
  },
  button: {
    width: '100%',
  },
  bottomSeparator: {
    marginBottom: getDesignRelativeHeight(25),
  },
})

export default withStyles(getStylesFromProps)(IntroScreen)
