import React, { useCallback, useEffect } from 'react'
import { View } from 'react-native'

import Text from '../../common/view/Text'
import Separator from '../../common/layout/Separator'
import { CustomButton, Section, Wrapper } from '../../common'
import FaceVerificationErrorSmiley from '../../common/animations/FaceVerificationErrorSmiley'

import { isMobileOnly } from '../../../lib/utils/platform'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'

import { fireEvent, FV_NOTMATCHERROR } from '../../../lib/analytics/analytics'

const NotMatchError = ({ styles, displayTitle, onRetry, nav, exception }) => {
  const onContactSupport = useCallback(() => nav.navigateTo('Support'), [nav])

  useEffect(() => {
    if (!exception) {
      return
    }

    fireEvent(FV_NOTMATCHERROR)
  }, [])

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="medium" textTransform="none" color="red">
            {displayTitle && displayTitle}
            {(displayTitle ? `,\n` : '') + "Unfortunately,\nwe couldn't confirm your identity..."}
          </Section.Title>
          <Section.Row justifyContent="space-evenly">
            <View style={styles.halfIllustration}>
              <FaceVerificationErrorSmiley />
            </View>
            <View style={styles.halfIllustration}>
              <FaceVerificationErrorSmiley />
            </View>
          </Section.Row>
          <Section style={styles.errorSection}>
            <Separator width={2} />
            <View style={styles.descriptionWrapper}>
              <Text color="primary" fontWeight="bold" fontSize={18} lineHeight={25}>
                {"Your face doesn't match the snapshot\nfrom the previous verification"}
              </Text>
              <Text color="primary" fontSize={18} lineHeight={25}>
                {
                  "You could pass verification only by yourself\nIf you're sure this is your account\nplease contact our support"
                }
              </Text>
            </View>
            <Separator width={2} />
          </Section>
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
    halfIllustration: {
      marginTop: isMobileOnly ? getDesignRelativeHeight(25) : 0,
      marginBottom: isMobileOnly ? getDesignRelativeHeight(30) : 0,
      width: getDesignRelativeWidth(130, false),
      maxHeight: isMobileOnly ? getDesignRelativeHeight(97) : 'auto',
      display: 'flex',
      justifyContent: 'center',
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

export default withStyles(getStylesFromProps)(NotMatchError)
