// libraries
import React from 'react'
import { Image, Platform, View } from 'react-native'
import { noop } from 'lodash'

// components
import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'

// utils
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import { withStyles } from '../../../../lib/styles'
import { isBrowser } from '../../../../lib/utils/platform'
import { isLargeDevice } from '../../../../lib/utils/mobileSizeDetect'

// assets
import illustration from '../../../../assets/FRInstructions.png'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const Instructions = ({ styles, onDismiss = noop }) => (
  <Wrapper>
    <Section style={styles.topContainer} grow>
      <View style={styles.mainContent}>
        <Image source={illustration} resizeMode="contain" style={styles.illustration} />
        <View>
          <Text textAlign="center" style={styles.descriptionContainer}>
            <Text style={[styles.text]}>{`• Hold Your Camera at Eye Level\n`}</Text>
            <Text style={[styles.text]}>{`• Light Your Face Evenly\n`}</Text>
            <Text style={[styles.text]}>{`• Avoid Smiling & Back Light\n`}</Text>
          </Text>
        </View>
        <CustomButton style={[styles.button]} onPress={onDismiss}>
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
    paddingLeft: getDesignRelativeWidth(theme.sizes.default * 3),
    paddingRight: getDesignRelativeWidth(theme.sizes.default * 3),
    width: '100%',
  },
  illustration: {
    marginTop: getDesignRelativeHeight(18),
    marginBottom: getDesignRelativeHeight(18),
    height: getDesignRelativeWidth(isBrowser ? 220 : 180),
    width: '100%',
  },
  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : 14),
  },
  button: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
    color: 'primary',
    fontSize: isLargeDevice ? 18 : 16,
    lineHeight: 25,
  },
})

export default withStyles(getStylesFromProps)(Instructions)
