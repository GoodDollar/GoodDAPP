import React, { useEffect } from 'react'
import { Image, Platform, View } from 'react-native'

import Text from '../../../common/view/Text'
import Separator from '../../../common/layout/Separator'
import { CustomButton, Section, Wrapper } from '../../../common'
import illustration from '../../../../assets/FRPortraitModeError.svg'

import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import { isMobileOnly } from '../../../../lib/utils/platform'
import { withStyles } from '../../../../lib/styles'

import { fireEvent, FV_WRONGORIENTATION } from '../../../../lib/analytics/analytics'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const DeviceOrientationError = ({ styles, displayTitle, onRetry, exception }) => {
  useEffect(() => {
    if (!exception) {
      return
    }

    fireEvent(FV_WRONGORIENTATION)
  }, [])

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="medium" textTransform="none" color="red">
            {displayTitle}
            {',\nplease turn your camera\nto portrait mode'}
          </Section.Title>
          <Image source={illustration} resizeMode="contain" style={styles.errorImage} />
          <Section style={styles.errorSection}>
            <Separator width={2} />
            <View style={styles.descriptionWrapper}>
              <Text color="primary" fontSize={18} lineHeight={25}>
                {'It’s a nice landscape,\nbut we need to see your face'}
              </Text>
              <Text color="primary" fontWeight="bold" fontSize={18} lineHeight={25}>
                only in portrait mode
              </Text>
            </View>
            <Separator width={2} />
          </Section>
        </Section>
        <View style={styles.action}>
          <CustomButton onPress={onRetry}>PLEASE TRY AGAIN</CustomButton>
        </View>
      </View>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
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
  }
}

export default withStyles(getStylesFromProps)(DeviceOrientationError)
