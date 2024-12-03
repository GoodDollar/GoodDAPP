import React, { useEffect } from 'react'
import { View } from 'react-native'
import { t } from '@lingui/macro'

import Text from '../../common/view/Text'
import Separator from '../../common/layout/Separator'
import { Section } from '../../common'
import FaceVerificationErrorSmiley from '../../common/animations/FaceVerificationErrorSmiley'

import { isMobileOnly } from '../../../lib/utils/platform'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'

import { fireEvent, FV_AGECHECKERROR } from '../../../lib/analytics/analytics'

const AgeCheckError = ({ styles, displayTitle, onRetry, nav, exception }) => {
  useEffect(() => {
    if (!exception) {
      return
    }

    fireEvent(FV_AGECHECKERROR)
  }, [])

  return (
    <Section style={styles.descriptionContainer} justifyContent="space-evenly">
      <Section.Title fontWeight="medium" textTransform="none" color="red">
        {t`You must be 18 years or older to get verified`}
      </Section.Title>
      <Section.Row justifyContent="space-around">
        <View style={styles.halfIllustration}>
          <FaceVerificationErrorSmiley />
        </View>
      </Section.Row>
      <Section style={styles.errorSection}>
        <Separator width={2} />
        <View style={styles.descriptionWrapper}>
          <Text color="primary" fontWeight="bold" fontSize={18} lineHeight={25}>
            {t`It seems your are under 18 years of age`}
          </Text>
          <Text color="primary" fontSize={18} lineHeight={25}>
            {t`If you think this is a mistake
                  please contact our support`}
          </Text>
        </View>
        <Separator width={2} />
      </Section>
    </Section>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
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

export default withStyles(getStylesFromProps)(AgeCheckError)
