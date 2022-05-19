import React, { useEffect } from 'react'
import { View } from 'react-native'
import { get } from 'lodash'

import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'

import { withStyles } from '../../../../lib/styles'
import { isBrowser, isMobileOnly } from '../../../../lib/utils/platform'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import FVErrorGeneralSVG from '../../../../assets/FaceVerification/FVErrorGeneral.svg'

import { fireEvent, FV_GENERALERROR } from '../../../../lib/analytics/analytics'

const GeneralError = ({ styles, displayTitle, onRetry, exception }) => {
  useEffect(() => {
    if (!exception) {
      return
    }

    const reason = get(exception, 'message')

    fireEvent(FV_GENERALERROR, { reason })
  }, [])

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="regular" textTransform="none" color="red">
            <Section.Title fontWeight="bold" textTransform="none" color="red">
              {displayTitle}
            </Section.Title>
            {',\nSomething went wrong\non our side...'}
          </Section.Title>
          <Section style={styles.errorSection}>
            <View style={styles.descriptionWrapper}>
              <Text fontSize={18} lineHeight={25}>
                {"You see, it's not that easy to \ncapture your beauty :)"}
              </Text>
              <Text fontWeight="bold" fontSize={18} lineHeight={25}>
                So, let`s give it another shot...
              </Text>
            </View>
          </Section>
          <View style={styles.errorImage}>
            <FVErrorGeneralSVG />
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
      height: getDesignRelativeWidth(isBrowser ? 220 : 166),
      width: '100%',
      marginTop: isMobileOnly ? getDesignRelativeHeight(15) : 0,
      marginBottom: isMobileOnly ? getDesignRelativeHeight(20) : 0,
      marginRight: 'auto',
      marginLeft: 'auto',
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
