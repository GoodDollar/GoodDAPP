import React from 'react'
import { View } from 'react-native'

import Text from '../../../common/view/Text'
import Separator from '../../../common/layout/Separator'
import { CustomButton, Section, Wrapper } from '../../../common'
import FaceVerificationErrorSmiley from '../../../common/animations/FaceVerificationErrorSmiley'

import useOnPress from '../../../../lib/hooks/useOnPress'
import { isMobileOnly } from '../../../../lib/utils/platform'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import { withStyles } from '../../../../lib/styles'

const DuplicateFoundError = ({ styles, displayTitle, onRetry, screenProps }) => {
  const onRetryPress = useOnPress(onRetry)
  const onContactSupport = useOnPress(() => screenProps.navigateTo('Support'), [screenProps])

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="medium" textTransform="none">
            {displayTitle}
            {',\nUnfortunately,\nWe found your twin...'}
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
              <Text color="primary" fontWeight="bold">
                You can open ONLY ONE account per person.
              </Text>
              <Text color="primary">If this is your only active account - please contact our support</Text>
            </View>
            <Separator width={2} />
          </Section>
        </Section>
        <View style={styles.action}>
          <CustomButton onPress={onContactSupport} mode="outlined" style={styles.actionsSpace}>
            CONTACT SUPPORT
          </CustomButton>
          <CustomButton onPress={onRetryPress}>TRY AGAIN</CustomButton>
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
      marginTop: isMobileOnly ? getDesignRelativeHeight(32) : 0,
      marginBottom: isMobileOnly ? getDesignRelativeHeight(40) : 0,
      width: getDesignRelativeWidth(100, false),
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
