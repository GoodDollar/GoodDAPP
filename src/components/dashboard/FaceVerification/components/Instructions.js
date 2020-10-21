// libraries
import React from 'react'
import { Image, Platform, View } from 'react-native'
import { noop } from 'lodash'

// components
import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'

// utils
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import normalize from '../../../../lib/utils/normalizeText'
import { withStyles } from '../../../../lib/styles'
import { isBrowser } from '../../../../lib/utils/platform'
import { isLargeDevice } from '../../../../lib/utils/mobileSizeDetect'

// assets
import illustration from '../../../../assets/FRInstructions.png'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const Dot = ({ style }) => <Text style={style}>• </Text>

const Instructions = ({ styles, onDismiss = noop }) => (
  <Wrapper>
    <Section style={styles.topContainer} grow>
      <View style={styles.mainContent}>
        <Image source={illustration} resizeMode="contain" style={styles.illustration} />
        <View style={styles.descriptionContainer}>
          <View>
            <Text style={styles.text}>
              <Dot style={styles.listDot} />
              Hold Your Camera at Eye Level
            </Text>
            <Text style={styles.text}>
              <Dot style={styles.listDot} />
              Light Your Face Evenly
            </Text>
            <Text style={styles.text}>
              <Dot style={styles.listDot} />
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
    width: '100%',
  },
  illustration: {
    marginTop: getDesignRelativeHeight(18),
    height: getDesignRelativeHeight(254, false),
    width: '100%',
  },
  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : 14),
    alignItems: 'center',
  },
  button: {
    width: '100%',
  },
  text: {
    textAlign: 'left',
    color: 'primary',
    fontSize: normalize(isLargeDevice ? 22 : 20),
    lineHeight: isLargeDevice ? 36 : 34,
  },
  listDot: {
    color: theme.colors.primary,
    fontSize: 'inherit',
    fontWeight: 'bold',
  },
})

export default withStyles(getStylesFromProps)(Instructions)
