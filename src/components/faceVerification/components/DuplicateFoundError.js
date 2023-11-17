import React, { useEffect } from 'react'
import { View } from 'react-native'
import { t } from '@lingui/macro'

import Text from '../../common/view/Text'
import { Section } from '../../common'

import { isMobileOnly } from '../../../lib/utils/platform'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'
import FVErrorTwinSVG from '../../../assets/FaceVerification/FVErrorTwin.svg'

import { fireEvent, FV_DUPLICATEERROR } from '../../../lib/analytics/analytics'

const DuplicateFoundError = ({ styles, displayTitle, onRetry, nav, exception }) => {
  useEffect(() => {
    if (!exception) {
      return
    }

    fireEvent(FV_DUPLICATEERROR)
  }, [])

  return (
    <Section style={styles.descriptionContainer} justifyContent="space-evenly">
      <Section.Title fontWeight="regular" textTransform="none" color="red">
        {displayTitle && (
          <Section.Title fontWeight="bold" textTransform="none" color="red">
            {displayTitle}
          </Section.Title>
        )}
        {(displayTitle ? `,\n` : '') +
          t`Unfortunately we found 
            your twin...`}
      </Section.Title>
      <Section style={styles.errorSection}>
        <View style={styles.descriptionWrapper}>
          <Text>
            <Text fontSize={18} lineHeight={25} fontWeight="bold">
              {t`You can open ONLY ONE account 
                  per person. `}
            </Text>
            <Text fontSize={18} lineHeight={25}>
              {t`If this is your only active 
                  account - please contact our support`}
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
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
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
