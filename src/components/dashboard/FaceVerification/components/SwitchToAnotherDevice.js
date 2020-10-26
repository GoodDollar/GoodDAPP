import React from 'react'
import { Image, Platform, View } from 'react-native'

import Text from '../../../common/view/Text'
import Separator from '../../../common/layout/Separator'
import { CustomButton, Section, Wrapper } from '../../../common'

import useOnPress from '../../../../lib/hooks/useOnPress'
import { isBrowser } from '../../../../lib/utils/platform'

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
        <Section style={styles.descriptionContainer} justifyContent="space-between">
          <Section.Title fontWeight="medium" textTransform="none" color="red">
            {displayTitle}
            {',\nPlease try to switch\nto another device'}
          </Section.Title>
          <Image
            source={illustration}
            resizeMode="contain"
            style={[styles.errorImage, isBrowser ? styles.browserSizing : {}]}
          />
          <Section style={[styles.errorSection, isBrowser ? styles.browserSizing : {}]}>
            <Separator width={2} />
            <View style={styles.descriptionWrapper}>
              <Text color="primary" fontSize={18} lineHeight={25}>
                {'Sometimes, switching to a\ndifferent device is a good solution.'}
              </Text>
              <Text color="primary" fontWeight="bold" fontSize={18} lineHeight={25}>
                {'Sorry about that… :)'}
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
    display: 'flex',
    backgroundColor: theme.colors.surface,
    height: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
    borderRadius: theme.sizes.borderRadius,
  },
  errorImage: {
    height: getDesignRelativeHeight(146, false),
  },
  descriptionContainer: {
    flex: 1,
    marginBottom: 0,
    paddingBottom: getDesignRelativeHeight(44),
    paddingHorizontal: getDesignRelativeWidth(theme.sizes.defaultQuadruple),
    paddingTop: isBrowser ? getDesignRelativeHeight(22) : 0,
    width: '100%',
  },
  action: {
    width: '100%',
    paddingHorizontal: getDesignRelativeWidth(theme.sizes.default),
  },
  errorSection: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  descriptionWrapper: {
    paddingVertical: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : theme.sizes.default),
  },
  browserSizing: {
    flexGrow: 1,
    justifyContent: 'center',
  },
})

export default withStyles(getStylesFromProps)(SwitchToAnotherDevice)
