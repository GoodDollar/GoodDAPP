// libraries
import React from 'react'
import { Image, ImageBackground, Platform, View } from 'react-native'
import { noop } from 'lodash'

// components
import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'

// hooks
import createABTesting from '../../../../lib/hooks/useABTesting'

// utils
import { getDesignRelativeHeight, getDesignRelativeWidth, isLargeDevice } from '../../../../lib/utils/sizes'
import normalize from '../../../../lib/utils/normalizeText'
import { withStyles } from '../../../../lib/styles'
import { isBrowser } from '../../../../lib/utils/platform'
import { FV_INSTRUCTIONS } from '../../../../lib/analytics/analytics'

// assets
import illustration from '../../../../assets/FRInstructions.png'

import QuestionMark from '../../../../assets/FaceVerification/FVQuestionMark.svg'
import CheckMark from '../../../../assets/FaceVerification/CheckMark.svg'
import { theme } from '../../../theme/styles'

const { useABTesting } = createABTesting()

const portrait = Platform.select({
  native: () => require('../../../../assets/FaceVerification/FVPortrait.png'),
  default: () => require('../../../../assets/FaceVerification/FVPortrait2x.png'),
})()

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
  Image.prefetch(portrait)
}

const Dot = () => (
  <Text
    color="primary"
    fontSize={normalize(isLargeDevice ? 22 : 20)}
    lineHeight={isLargeDevice ? 36 : 34}
    fontWeight="bold"
  >
    •{' '}
  </Text>
)

const InstructionsA = ({ styles, onDismiss = noop, ready }) => (
  <Wrapper>
    <Section style={styles.topContainer} grow>
      <View style={styles.mainContent}>
        <Image source={illustration} resizeMode="contain" style={styles.illustration} />
        <View style={styles.descriptionContainer}>
          <View style={styles.descriptionWrapper}>
            <Text style={styles.text}>
              <Dot />
              Hold Your Camera at Eye Level
            </Text>
            <Text style={styles.text}>
              <Dot />
              Light Your Face Evenly
            </Text>
            <Text style={styles.text}>
              <Dot />
              Avoid Smiling & Back Light
            </Text>
          </View>
        </View>
        <CustomButton
          loading={!ready}
          enabled={ready}
          style={[styles.button]}
          onPress={onDismiss}
          testID="dismiss_button"
        >
          GOT IT
        </CustomButton>
      </View>
    </Section>
  </Wrapper>
)

const InstructionsB = ({ styles, onDismiss = noop, ready }) => (
  <Wrapper>
    <Section style={styles.topContainerB} grow>
      <View style={styles.mainContentB}>
        <ImageBackground source={portrait} style={styles.imageBackgroundB} imageStyle={{ borderRadius: 5 }} />
        <View style={styles.descriptionContainerB}>
          <View style={styles.descriptionWrapperB}>
            <QuestionMark style={styles.questionMarkB} />
            <Text fontWeight="bold" style={[styles.textB, { paddingTop: 12 }]}>
              Make sure you...
            </Text>
            <Text style={[styles.textB, { marginTop: 7 }]}>
              <CheckMark style={{ marginRight: theme.sizes.default }} />
              Hold Your Camera at Eye Level
            </Text>
            <Text style={[styles.textB, { marginTop: 3, marginBottom: 14 }]}>
              <CheckMark style={{ marginRight: theme.sizes.default }} />
              Light Your Face Evenly
            </Text>
          </View>
        </View>
        <CustomButton
          style={[styles.button, { height: 53 }]}
          onPress={onDismiss}
          testID="dismiss_button"
          loading={!ready}
          enabled={ready}
        >
          GOT IT
        </CustomButton>
      </View>
    </Section>
  </Wrapper>
)

const Instructions = ({ styles, onDismiss = noop, ready = false }) => {
  const [InstructionsComponent] = useABTesting(InstructionsA, InstructionsB, FV_INSTRUCTIONS)

  return <InstructionsComponent styles={styles} onDismiss={onDismiss} ready={ready} />
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
  topContainerB: {
    display: Platform.select({ web: 'contents', default: 'flex' }),
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  mainContentB: {
    flexGrow: 1,
    paddingHorizontal: getDesignRelativeHeight(10),
    paddingBottom: getDesignRelativeHeight(10),
  },
  illustration: {
    marginTop: getDesignRelativeHeight(18),
    height: getDesignRelativeHeight(254, false),
    width: '100%',
  },
  imageBackgroundB: {
    flex: 1,
    ...Platform.select({
      web: { position: 'static' },
      default: {},
    }),
  },
  questionMarkB: {
    position: 'absolute',
    right: 0,
    marginTop: 9,
    marginRight: 10,
  },
  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : 14),
    alignItems: 'center',
  },
  descriptionContainerB: {
    paddingVertical: getDesignRelativeHeight(isBrowser ? 12 : 10),
  },
  descriptionWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  descriptionWrapperB: {
    backgroundColor: theme.colors.darkGray,
    borderRadius: 8,
  },
  button: {
    width: '100%',
  },
  text: {
    textAlign: 'left',
    fontSize: normalize(isLargeDevice ? 22 : 20),
    lineHeight: isLargeDevice ? 36 : 34,
  },
  textB: {
    textAlign: 'left',
    paddingLeft: 18,
    fontSize: 16,
    letterSpacing: 0.16,
    color: theme.colors.white,
  },
})

export default withStyles(getStylesFromProps)(Instructions)
