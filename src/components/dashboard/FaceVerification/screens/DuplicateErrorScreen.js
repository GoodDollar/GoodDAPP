// Please follow those imports order (need to add eslint rule for that)

// 1. React
import React, { useMemo } from 'react'

// 2. React Native
import { View } from 'react-native'

// 3. Libraries components (here're absent)
import { noop } from 'lodash'

// 4. common components
import Text from '../../../common/view/Text'
import Separator from '../../../common/layout/Separator'
import { CustomButton, Section, Wrapper } from '../../../common'
import { isMobileOnly } from '../../../../lib/utils/platform'

// 5. local components like ResultStep, GuidedResults and others from FaceVerification (here're absent)

// 6. FLUX imports: store, reducers, actions
import GDStore from '../../../../lib/undux/GDStore'

// 7. Utilities
import { getFirstWord } from '../../../../lib/utils/getFirstWord'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'

// 8. styles & assets
import { withStyles } from '../../../../lib/styles'
import FaceVerificationErrorSmiley from '../../../common/animations/FaceVerificationErrorSmiley'

const DuplicateErrorScreen = ({ styles }) => {
  const store = GDStore.useStore()

  const displayTitle = useMemo(() => {
    const { fullName } = store.get('profile')

    return `${getFirstWord(fullName)},\nUnfortunately,\nWe found your twin...`
  }, [store])

  const retry = noop

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="medium" textTransform="none">
            {displayTitle}
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
          <CustomButton onPress={retry} mode="outlined" style={styles.actionsSpace}>
            CONTACT SUPPORT
          </CustomButton>
          <CustomButton onPress={retry}>TRY AGAIN</CustomButton>
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

export default withStyles(getStylesFromProps)(DuplicateErrorScreen)
