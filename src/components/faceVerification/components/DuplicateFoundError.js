import React, { useCallback, useEffect } from 'react'
import { View } from 'react-native'

import Text from '../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../common'

import { isMobileOnly } from '../../../lib/utils/platform'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'
import FVErrorTwinSVG from '../../../assets/FaceVerification/FVErrorTwin.svg'

import { fireEvent, FV_DUPLICATEERROR } from '../../../lib/analytics/analytics'

const DuplicateFoundError = ({ styles, displayTitle, onRetry, nav, exception }) => {
  const onContactSupport = useCallback(() => nav.navigateTo('Support'), [nav])

  useEffect(() => {
    if (!exception) {
      return
    }

    fireEvent(FV_DUPLICATEERROR)
  }, [])

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="regular" textTransform="none" color="red">
            {displayTitle && (
              <Section.Title fontWeight="bold" textTransform="none" color="red">
                {displayTitle}
              </Section.Title>
            )}
            {(displayTitle ? `,\n` : '') + 'Unfortunately we found \nyour twin...'}
          </Section.Title>
          <Section style={styles.errorSection}>
            <View style={styles.descriptionWrapper}>
              <Text>
                <Text fontSize={18} lineHeight={25} fontWeight="bold">
                  {'You can open ONLY ONE account \nper person. '}
                </Text>
                <Text fontSize={18} lineHeight={25}>
                  {'If this is your only active \naccount - please contact our support'}
                </Text>
              </Text>
            </View>
          </Section>
          <Section.Row justifyContent="space-evenly">
            <View style={styles.errorImage}>
              <FVErrorTwinSVG />
            </View>
          </Section.Row>
        </Section>
        <View style={styles.action}>
          <CustomButton onPress={onContactSupport} mode="outlined" style={styles.actionsSpace}>
            CONTACT SUPPORT
          </CustomButton>
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
      height: getDesignRelativeHeight(146, false),
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 0,
      marginLeft: 0,
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
    actionsSpace: {
      marginBottom: getDesignRelativeHeight(16),
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

export default withStyles(getStylesFromProps)(DuplicateFoundError)
