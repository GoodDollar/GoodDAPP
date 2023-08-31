// @flow
import React from 'react'
import { Platform, View } from 'react-native'
import { t } from '@lingui/macro'

import Section from '../common/layout/Section'
import Text from '../common/view/Text'
import { withStyles } from '../../lib/styles'
import MagicLinkSVG from '../../assets/Signup/maginLinkIllustration.svg'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { theme } from '../theme/styles'
import CustomWrapper from './signUpWrapper'

const MagicLinkInfoComponent = props => {
  const { styles, screenProps = {} } = props
  const { doneCallback } = screenProps

  return (
    <CustomWrapper valid={true} handleSubmit={doneCallback} submitText={t`Cool, got it!`}>
      <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
        <View style={styles.headerContainer}>
          <Text
            fontWeight="bold"
            fontSize={28}
            fontFamily={theme.fonts.slab}
            color="primary"
            style={styles.headerText}
            lineHeight={28}
          >
            {t`GOOD TO KNOW`}
          </Text>
        </View>
      </Section.Row>
      <View style={styles.illustration}>
        <MagicLinkSVG />
      </View>
      <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
        <View style={styles.bottomContainer}>
          <Text fontWeight="medium" fontSize={22} fontFamily="Roboto">
            <Text fontWeight="bold" fontSize="Roboto">
              {t` Next time
              you can sign in
              from any device
              using your`}
            </Text>
            <Text fontWeight="bold" fontSize={22}>{t`Magic Link`}</Text>
          </Text>
        </View>
      </Section.Row>
      <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
        <View style={styles.bottomContainer}>
          <Text fontSize={14} fontFamily="Roboto" lineHeight={20}>
            {t`Just find the `}
            <Text fontSize={14} fontFamily="Roboto" lineHeight={20} fontWeight="bold">{`GoodDollar Magic Mail`}</Text>
          </Text>
          <Text fontSize={14} fontFamily="Roboto" lineHeight={20}>
            {t`that we’ll soon send you `}
          </Text>
        </View>
      </Section.Row>
    </CustomWrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    headerText: {
      paddingBottom: getDesignRelativeHeight(5),
    },
    mainWrapper: {
      display: 'flex',
      paddingHorizontal: 0,
      justifyContent: 'space-evenly',
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      width: '100%',
      maxHeight: getDesignRelativeHeight(175),
      minHeight: getDesignRelativeHeight(95),
      alignSelf: 'center',
    },
    headerContainer: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
      ...Platform.select({
        web: {
          borderBottomStyle: 'solid',
        },
      }),
    },
  }
}

const MagicLinkInfo = withStyles(getStylesFromProps)(MagicLinkInfoComponent)

MagicLinkInfo.navigationOptions = {
  title: 'Magic Link',
}

export default withStyles(getStylesFromProps)(MagicLinkInfo)
