import React, { useEffect } from 'react'
import { View } from 'react-native'
import { get } from 'lodash'

import Text from '../../../common/view/Text'
import Separator from '../../../common/layout/Separator'
import { CustomButton, Section, Wrapper } from '../../../common'
import FaceVerificationErrorSmiley from '../../../common/animations/FaceVerificationErrorSmiley'

import useOnPress from '../../../../lib/hooks/useOnPress'
import { withStyles } from '../../../../lib/styles'
import { isBrowser, isMobileOnly } from '../../../../lib/utils/platform'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'

import { fireEvent, FV_GENERALERROR } from '../../../../lib/analytics/analytics'

const GeneralError = ({ styles, displayTitle, onRetry, screenProps }) => {
  const onRetryPress = useOnPress(onRetry)
  const reason = get(screenProps, 'screenState.error.message')

  useEffect(() => void fireEvent(FV_GENERALERROR, { reason }), [])

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="medium" textTransform="none" color="red">
            {displayTitle}
            {',\nSomething went wrong\non our side...'}
          </Section.Title>
          <View style={styles.illustration}>
            <FaceVerificationErrorSmiley />
          </View>
          <Section style={styles.errorSection}>
            <Separator width={2} />
            <View style={styles.descriptionWrapper}>
              <Text color="primary" fontSize={18} lineHeight={25}>
                {"You see, it's not that easy\nto capture your beauty :)"}
              </Text>
              <Text color="primary" fontWeight="bold" fontSize={18} lineHeight={25}>
                So, let`s give it another shot...
              </Text>
            </View>
            <Separator width={2} />
          </Section>
        </Section>
        <View style={styles.action}>
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
