import React from 'react'

import { Image, Platform, View } from 'react-native'

import { CustomButton, Section, Wrapper } from '../../../common'

import useOnPress from '../../../../lib/hooks/useOnPress'
import { isMobileOnly } from '../../../../lib/utils/platform'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import { withStyles } from '../../../../lib/styles'
import illustration from '../../../../assets/FRUnrecoverableError.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const UnrecoverableError = ({ styles, screenProps }) => {
  const onContactSupport = useOnPress(() => screenProps.navigateTo('Support'), [screenProps])
  const onDismiss = useOnPress(() => screenProps.goToRoot(), [screenProps])

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="medium" textTransform="none">
            {'Sorry about that…\nWe’re looking in to it,\nplease try again later'}
          </Section.Title>
          <Image source={illustration} resizeMode="contain" style={styles.errorImage} />
        </Section>
        <View style={styles.action}>
          <CustomButton onPress={onDismiss} style={styles.actionsSpace}>
            OK
          </CustomButton>
          <CustomButton mode="outlined" onPress={onContactSupport}>
            CONTACT SUPPORT
          </CustomButton>
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
      height: getDesignRelativeHeight(230, false),
      marginTop: isMobileOnly ? getDesignRelativeHeight(32) : 0,
      marginBottom: isMobileOnly ? getDesignRelativeHeight(40) : 0,
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
  }
}

export default withStyles(getStylesFromProps)(UnrecoverableError)
