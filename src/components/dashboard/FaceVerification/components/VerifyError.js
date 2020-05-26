// Please follow those imports order (need to add eslint rule for that)

// 1. React
import React, { useEffect, useMemo } from 'react'

// 2. React Native
import { Image, Platform, View } from 'react-native'

// 3. Libraries components (here're absent)

// 4. common components
import Text from '../../../common/view/Text'
import Separator from '../../../common/layout/Separator'
import { Section, Wrapper } from '../../../common'
import { isMobileOnly } from '../../../../lib/utils/platform'

// 5. local components like ResultStep, GuidedResults and others from FaceVerification (here're absent)

// 6. FLUX imports: store, reducers, actions
import GDStore from '../../../../lib/undux/GDStore'

// 7. Utilities
import logger from '../../../../lib/logger/pino-logger'
import { getFirstWord } from '../../../../lib/utils/getFirstWord'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'

// 8. styles & assets
import { withStyles } from '../../../../lib/styles'
import Oops from '../../../../assets/oops.svg'

const defaultLogger = logger.child({ from: 'VerifyError' })

if (Platform.OS === 'web') {
  Image.prefetch(Oops)
}

const VerifyError = ({
  styles,
  reason,
  description,
  boldDescription,
  action,
  imageSource,
  twoErrorImages,
  titleWithoutUsername,
  title = 'Something went wrong...',
  log = defaultLogger,
}) => {
  const store = GDStore.useStore()
  const { error, message } = reason || {}
  const showDescription = Boolean(description || boldDescription || error || message || reason)
  const displayTitle = useMemo(() => {
    if (titleWithoutUsername) {
      return title
    }

    const { fullName } = store.get('profile')

    return `${getFirstWord(fullName)},\n${title}`
  }, [store])

  useEffect(() => {
    log.debug({ styles, reason })
  }, [styles, reason])

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.descriptionContainer} justifyContent="space-evenly">
          <Section.Title fontWeight="medium" textTransform="none">
            {displayTitle}
          </Section.Title>
          {twoErrorImages ? (
            <Section.Row justifyContent="space-evenly">
              <Image source={imageSource || Oops} resizeMode="contain" style={styles.halfErrorImage} />
              <Image source={imageSource || Oops} resizeMode="contain" style={styles.halfErrorImage} />
            </Section.Row>
          ) : (
            <Image source={imageSource || Oops} resizeMode="contain" style={styles.errorImage} />
          )}
          {showDescription && (
            <Section style={styles.errorSection}>
              <Separator width={2} />
              <View style={styles.descriptionWrapper}>
                {boldDescription && (
                  <Text color="primary" fontWeight="bold">
                    {boldDescription}
                  </Text>
                )}
                <Text color="primary">{`${description || error || message || reason}`}</Text>
              </View>
              <Separator width={2} />
            </Section>
          )}
        </Section>
        {action && <View style={styles.action}>{action}</View>}
      </View>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  const errorImage = {
    height: getDesignRelativeHeight(146, false),
    marginTop: isMobileOnly ? getDesignRelativeHeight(32) : 0,
    marginBottom: isMobileOnly ? getDesignRelativeHeight(40) : 0,
  }

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
    errorImage,
    halfErrorImage: {
      ...errorImage,
      width: getDesignRelativeWidth(97, false),
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

export default withStyles(getStylesFromProps)(VerifyError)
