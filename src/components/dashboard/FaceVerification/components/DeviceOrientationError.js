import React, { useEffect } from 'react'
import { View } from 'react-native'

import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'

import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import { isMobileOnly } from '../../../../lib/utils/platform'
import { withStyles } from '../../../../lib/styles'
import FVErrorLandscapeSVG from '../../../../assets/FaceVerification/FVErrorLandscape.svg'

import { fireEvent, FV_WRONGORIENTATION } from '../../../../lib/analytics/analytics'
import useDeviceOrientation from '../../../../lib/hooks/useDeviceOrientation'

const SVGHeight = {
  portrait: getDesignRelativeHeight(176, false),
  landscape: getDesignRelativeHeight(175, false),
}

const DeviceOrientationError = ({ styles, displayTitle, onRetry, exception }) => {
  const orientation = useDeviceOrientation()
  const svgHeight = SVGHeight[orientation]

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
          <Section.Title fontWeight="regular" textTransform="none" color="red">
            <Section.Title fontWeight="bold" textTransform="none" color="red">
              {displayTitle}
            </Section.Title>
            {',\nPlease turn your camera\nto portrait mode'}
          </Section.Title>
          <Section style={styles.errorSection}>
            <View style={styles.descriptionWrapper}>
              <Text>
                <Text fontSize={18} lineHeight={25}>
                  {'It’s a nice landscape, but we need \nto see your face '}
                </Text>
                <Text fontWeight="bold" fontSize={18} lineHeight={25}>
                  {'only in portrait \nmode.'}
                </Text>
              </Text>
            </View>
          </Section>
          <View style={[styles.errorImage, { height: svgHeight }]}>
            <FVErrorLandscapeSVG />
          </View>
        </Section>
        <View style={styles.action}>
          <CustomButton onPress={onRetry}>TRY AGAIN</CustomButton>
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
      marginTop: isMobileOnly ? getDesignRelativeHeight(15) : 0,
      marginBottom: isMobileOnly ? getDesignRelativeHeight(20) : 0,
      justifyContent: 'center',
      alignItems: 'center',
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
