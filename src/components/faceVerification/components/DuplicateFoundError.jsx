import React, { useCallback, useEffect } from 'react'
import { Linking, View } from 'react-native'
import { t } from '@lingui/macro'
import { get } from 'lodash'
import moment from 'moment'
import Text from '../../common/view/Text'
import { Section } from '../../common'

import { isMobileOnly } from '../../../lib/utils/platform'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'
import FVErrorTwinSVG from '../../../assets/FaceVerification/FVErrorTwin.svg'

import { fireEvent, FV_DUPLICATEERROR } from '../../../lib/analytics/analytics'

const DuplicateFoundError = ({ styles, displayTitle, onRetry, nav, exception }) => {
  const onLearnMore = useCallback(() => {
    Linking.openURL('https://docs.gooddollar.org/frequently-asked-questions/troubleshooting#help-it-says-i-have-a-twin')
  }, [])

  const expiration = get(exception, 'response.enrollmentResult.duplicate.expiration')

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
        {(displayTitle ? `,\n` : '') + t`We found your twin...`}
      </Section.Title>
      <Section style={styles.errorSection}>
        <View style={styles.descriptionWrapper}>
          <Text fontSize={16} lineHeight={25} fontWeight="bold">
            {t`You can verify ONLY ONE wallet address 
                  per person. `}
          </Text>
          <Text fontSize={18} lineHeight={25}>
            {t`If this is your only active 
                  account - please contact support.`}
          </Text>
        </View>
        {expiration && (
          <View marginTop={20}>
            <Text fontSize={16} lineHeight={25} fontWeight="bold">
              {t`The existing identity will expire on ${moment(expiration).format('l')}.
               After this expiry, you may verify a different wallet address.`}
            </Text>
            <Text
              color="primary"
              fontWeight="bold"
              fontSize={18}
              lineHeight={26}
              textDecorationLine="underline"
              style={styles.learnMore}
              onPress={onLearnMore}
            >
              {t`Learn More`}
            </Text>
          </View>
        )}
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
