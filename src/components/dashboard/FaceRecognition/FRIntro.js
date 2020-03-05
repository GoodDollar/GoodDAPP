import React from 'react'
import { View } from 'react-native'
import { isIOS, isMobileSafari } from 'mobile-device-detect'
import GDStore from '../../../lib/undux/GDStore'
import Separator from '../../common/layout/Separator'
import logger from '../../../lib/logger/pino-logger'
import Text from '../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../common'
import { fireEvent } from '../../../lib/analytics/analytics'
import { getFirstWord } from '../../../lib/utils/getFirstWord'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'
import FaceVerificationSmiley from '../../common/animations/FaceVerificationSmiley'
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
      <Section style={styles.topContainer} grow={1} justifyContent="center">
        <View style={styles.mainContent}>
          <Section.Title fontWeight="medium" textTransform="none" style={styles.mainTitle}>
            {`${getFirstWord(fullName)},\nLet's make sure you are a real live person`}
          </Section.Title>
          <FaceVerificationSmiley />
          <Separator width={2} />
          <Text style={styles.descriptionContainer}>
            <Text fontWeight="bold" color="primary" style={styles.description}>
              Since its your first transaction
            </Text>
            <Text color="primary" style={styles.description}>
              {`we will take a short video of you\nto prevent duplicate accounts.`}
            </Text>
            <Text
              fontWeight="bold"
              textDecoration="underline"
              color="primary"
              style={[styles.description, styles.descriptionUnderline]}
              onPress={gotoPrivacyArticle}
            >
              Learn more
            </Text>
          </Text>
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
    flexShrink: 0,
    paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.default),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
  description: {
    display: 'flex',
    paddingTop: 0,
  },
  descriptionUnderline: {
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
  },
  button: {
    marginTop: 'auto',
    width: '100%',
  },
  bottomSeparator: {
    marginBottom: getDesignRelativeHeight(28),
  },
})

export default withStyles(getStylesFromProps)(FRIntro)
