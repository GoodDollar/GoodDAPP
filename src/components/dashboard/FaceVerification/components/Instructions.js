// libraries
import React from 'react'
import { Image, Platform, View } from 'react-native'
import { noop } from 'lodash'

// components
import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'

// utils
import { getDesignRelativeHeight, getDesignRelativeWidth, isLargeDevice } from '../../../../lib/utils/sizes'
import normalize from '../../../../lib/utils/normalizeText'
import { withStyles } from '../../../../lib/styles'
import { isBrowser } from '../../../../lib/utils/platform'

import { AB } from '../utils/random'

// assets
import illustration from '../../../../assets/FRInstructions.png'
import portrait from '../../../../assets/FaceVerification/FVPortrait.png'

// import QuestionMark from '../../../../assets/FaceVerification/FVQuestionMark.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

if (Platform.OS === 'web') {
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

const InstructionsA = ({ styles, onDismiss = noop }) => (
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
        <CustomButton style={[styles.button]} onPress={onDismiss} testID="dismiss_button">
          GOT IT
        </CustomButton>
      </View>
    </Section>
  </Wrapper>
)

const InstructionsB = ({ styles, onDismiss = noop }) => (
  <Wrapper>
    <Section style={[styles.topContainerB, styles.illustrationB]} grow>
      <View style={styles.mainContentB}>
        {/* <Image source={portrait} resizeMode="cover" style={styles.illustration} /> */}
        <View style={styles.descriptionContainerB}>
          <View style={styles.descriptionWrapperB}>
            {/* <QuestionMark /> */}
            <Text fontWeight="bold" style={[styles.textB, { paddingTop: '12px' }]}>
              Make sure you...
            </Text>
            <Text style={styles.textB}>
              <Dot />
              Hold Your Camera at Eye Level
            </Text>
            <Text style={styles.textB}>
              <Dot />
              Light Your Face Evenly
            </Text>
            {/* <Text style={styles.text}>
              <Dot />
              Avoid Smiling & Back Light
            </Text> */}
          </View>
        </View>
        <CustomButton
          style={[styles.button]}
          onPress={onDismiss}
          testID="dismiss_button"
          contentStyle={{ minHeight: '53px' }}
          textStyle={{ fontSize: '16px', lineHeight: '19px', letterSpacing: '0.49px', fontWeight: 'bold' }}
        >
          GOT IT
        </CustomButton>
      </View>
    </Section>
  </Wrapper>
)

const Instructions = AB === 'A' ? InstructionsA : InstructionsB

// const Instructions = InstructionsB

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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.sizes.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    paddingBottom: getDesignRelativeHeight(theme.sizes.default * 1.5),
    paddingLeft: getDesignRelativeWidth(10),
    paddingRight: getDesignRelativeWidth(10),
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  mainContentB: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  illustration: {
    marginTop: getDesignRelativeHeight(18),
    height: getDesignRelativeHeight(254, false),
    width: '100%',
  },
  illustrationB: {
    width: '100%',
    height: '100%',
    backgroundImage: `url(${portrait})`,
    objectFit: 'contain',
  },
  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : 14),
    alignItems: 'center',
  },
  descriptionContainerB: {
    paddingHorizontal: getDesignRelativeHeight(2),
    paddingVertical: getDesignRelativeHeight(isBrowser ? 12 : 10),

    // alignItems: 'center',
  },
  descriptionWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  descriptionWrapperB: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.darkGray,
    borderRadius: '8px',

    // position: 'absolute',
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
    paddingLeft: '18px',

    // fontSize: normalize(16),
    fontSize: 16,
    lineHeight: '30px',
    letterSpacing: '0.16px',
    color: theme.colors.white,
  },
})

export default withStyles(getStylesFromProps)(Instructions)
