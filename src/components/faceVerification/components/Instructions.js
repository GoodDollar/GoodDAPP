// libraries
import React from 'react'
import { Image, Platform, View } from 'react-native'
import { noop } from 'lodash'

// components
import Text from '../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../common'

// utils
import { getDesignRelativeHeight, getDesignRelativeWidth, isLargeDevice } from '../../../lib/utils/sizes'
import normalize from '../../../lib/utils/normalizeText'
import { withStyles } from '../../../lib/styles'
import { isBrowser } from '../../../lib/utils/platform'

// assets
import illustration from '../../../assets/FRInstructions.png'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
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

const Instructions = ({ styles, onDismiss = noop, ready }) => (
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
    marginBottom: theme.paddings.bottomPadding,
  },
  topContainerB: {
    paddingVertical: 0,
    paddingHorizontal: 0,
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
    justifyContent: 'flex-end',
  },
  illustration: {
    marginTop: getDesignRelativeHeight(18),
    height: getDesignRelativeHeight(254, false),
    width: '100%',
  },
  imageBackgroundB: {
    flex: 1,
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
    paddingLeft: 18,
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
    fontSize: 16,
    letterSpacing: 0.16,
    color: theme.colors.white,
  },
  infoRow: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
})

export default withStyles(getStylesFromProps)(Instructions)
