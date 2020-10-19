import React from 'react'
import { Image, Platform, View } from 'react-native'

import Text from '../../../common/view/Text'
import Separator from '../../../common/layout/Separator'
import { CustomButton, Section, Wrapper } from '../../../common'

import useOnPress from '../../../../lib/hooks/useOnPress'
import { isMobileOnly } from '../../../../lib/utils/platform'

import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import { withStyles } from '../../../../lib/styles'
import illustration from '../../../../assets/FRSwitchToAnotherDevice.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const SwitchToAnotherDevice = ({ styles, displayTitle, exception, screenProps }) => {
  const { goToRoot } = screenProps
  const onDismiss = useOnPress(() => goToRoot(), [goToRoot])

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="medium" textTransform="none" color="red">
            {displayTitle}
            {',\nPlease try to switch\nto other device'}
          </Section.Title>
          <Image source={illustration} resizeMode="contain" style={styles.errorImage} />
          <Section style={styles.errorSection}>
            <Separator width={2} />
            <View style={styles.descriptionWrapper}>
              <Text color="primary" fontSize={18} lineHeight={25}>
                {'Sometimes, switching to a\ndifferent device is a good solution.'}
              </Text>
              <Text color="primary" fontWeight="bold" fontSize={18} lineHeight={25}>
                Sorry about that… :)
              </Text>
            </View>
            <Separator width={2} />
          </Section>
        </Section>
        <View style={styles.action}>
          <CustomButton onPress={onDismiss}>OK</CustomButton>
        </View>
      </View>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    display: 'flex',
    backgroundColor: theme.colors.surface,
    height: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.default),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
    borderRadius: 5,
  },
  errorImage: {
    height: getDesignRelativeHeight(146, false),
    marginTop: isMobileOnly ? getDesignRelativeHeight(32) : 0,
    marginBottom: isMobileOnly ? getDesignRelativeHeight(40) : 0,
  },
  descriptionContainer: {
    flex: 1,
    marginBottom: 0,
    paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.default),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(theme.sizes.default),
    width: '100%',
  },
  action: {
    width: '100%',
  },
  errorSection: {
    paddingBottom: 0,
    paddingTop: 0,
    marginBottom: 0,
  },
  descriptionWrapper: {
    paddingTop: getDesignRelativeHeight(25),
    paddingBottom: getDesignRelativeHeight(25),
  },
})

export default withStyles(getStylesFromProps)(SwitchToAnotherDevice)
