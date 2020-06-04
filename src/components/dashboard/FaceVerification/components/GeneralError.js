import React from 'react'
import { View } from 'react-native'

import Text from '../../../common/view/Text'
import Separator from '../../../common/layout/Separator'
import { CustomButton, Section, Wrapper } from '../../../common'
import FaceVerificationErrorSmiley from '../../../common/animations/FaceVerificationErrorSmiley'

import useOnPress from '../../../../lib/hooks/useOnPress'
import { withStyles } from '../../../../lib/styles'
import { isBrowser, isMobileOnly } from '../../../../lib/utils/platform'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'

const GeneralError = ({ styles, displayTitle, onRetry }) => {
  const onRetryPress = useOnPress(onRetry)

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="medium" textTransform="none">
            {displayTitle}
            {',\nSomething went wrong\non our side...'}
          </Section.Title>
          <View style={styles.illustration}>
            <FaceVerificationErrorSmiley />
          </View>
          <Section style={styles.errorSection}>
            <Separator width={2} />
            <View style={styles.descriptionWrapper}>
              <Text color="primary">
                {"You see, it's not that easy\nto capture your beauty :)\nSo, let's give it another shot..."}
              </Text>
            </View>
            <Separator width={2} />
          </Section>
        </Section>
        <View style={styles.action}>
          <CustomButton onPress={onRetryPress}>PLEASE TRY AGAIN</CustomButton>
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
    illustration: {
      height: getDesignRelativeWidth(isBrowser ? 220 : 130),
      width: '100%',
      marginTop: isMobileOnly ? getDesignRelativeHeight(27) : 0,
      marginBottom: isMobileOnly ? getDesignRelativeHeight(35) : 0,
      marginRight: 'auto',
      marginLeft: 'auto',
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

export default withStyles(getStylesFromProps)(GeneralError)
