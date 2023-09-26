import React, { useEffect } from 'react'
import { View } from 'react-native'
import { get } from 'lodash'
import { t } from '@lingui/macro'

import Text from '../../common/view/Text'
import { Section } from '../../common'

import { withStyles } from '../../../lib/styles'
import { isBrowser, isMobileOnly } from '../../../lib/utils/platform'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import FVErrorGeneralSVG from '../../../assets/FaceVerification/FVErrorGeneral.svg'

import { fireEvent, FV_GENERALERROR } from '../../../lib/analytics/analytics'

const GeneralError = ({ styles, displayTitle, onRetry, exception }) => {
  useEffect(() => {
    if (!exception) {
      return
    }

    const reason = get(exception, 'message')

    fireEvent(FV_GENERALERROR, { reason })
  }, [])

  return (
    <Section style={styles.descriptionContainer} justifyContent="space-evenly">
      <Section.Title fontWeight="regular" textTransform="none" color="red">
        <Section.Title fontWeight="bold" textTransform="none" color="red">
          {displayTitle}
        </Section.Title>
        {(displayTitle ? `,\n` : '') +
          t`Something went wrong 
            on our side...`}
      </Section.Title>
      <Section style={styles.errorSection}>
        <View style={styles.descriptionWrapper}>
          <Text fontSize={18} lineHeight={25}>
            {t`You see, it's not that easy to 
                capture your beauty :)`}
          </Text>
          <Text fontWeight="bold" fontSize={18} lineHeight={25}>
            {t`So, let’s give it another shot...`}
          </Text>
        </View>
      </Section>
      <View style={styles.errorImage}>
        <FVErrorGeneralSVG />
      </View>
    </Section>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
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
