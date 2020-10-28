// libraries
import React, { useMemo } from 'react'
import { Image, View } from 'react-native'

// components
import { noop } from 'lodash'
import { Icon, Section } from '../index'
import CustomButton from '../buttons/CustomButton'

// hooks
import useClipboard from '../../../lib/hooks/useClipboard'
import useOnPress from '../../../lib/hooks/useOnPress'

// utils
import { isBrowser } from '../../../lib/utils/platform'
import normalize from '../../../lib/utils/normalizeText'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { truncateMiddle } from '../../../lib/utils/string'

const copyIconSize = isBrowser ? 34 : normalize(24)

const BorderedBox = ({
  styles,
  theme,
  imageSource,
  title,
  content,
  copyButtonText,
  truncateContent = false,
  imageSize = 68,
  showCopyIcon = true,
  onCopied = noop,
}) => {
  const [, setString] = useClipboard()
  const displayContent = truncateContent ? truncateMiddle(content, 29) : content // 29 = 13 chars left side + 3 chars of '...' + 13 chars right side

  const copyToClipboard = useOnPress(() => {
    setString(content)
    onCopied()
  }, [onCopied, setString, content])

  const avatarStyles = useMemo(() => {
    const imageBoxSize = getDesignRelativeWidth(imageSize, false)
    const halfBoxSize = Math.ceil(imageBoxSize / 2)

    return [
      styles.avatar,
      {
        width: imageBoxSize,
        height: imageBoxSize,
        borderRadius: halfBoxSize, // half of height/width
        top: -halfBoxSize, // half of height
      },
    ]
  }, [imageSize, styles.avatar])

  const lineSeparatorStyles = useMemo(
    () => [
      styles.avatarLineSeparator,
      {
        width: getDesignRelativeWidth(imageSize + 20, false),
      },
    ],
    [imageSize, styles.avatarLineSeparator],
  )

  return (
    <Section style={styles.borderedBox}>
      <View style={lineSeparatorStyles} />
      <Image source={imageSource} style={avatarStyles} />
      <Section.Text fontSize={18} fontFamily="Roboto Slab" fontWeight="bold" style={styles.boxTitle}>
        {title}
      </Section.Text>
      <Section.Text fontSize={13} letterSpacing={0.07} color={theme.colors.lighterGray}>
        {displayContent}
      </Section.Text>
      <View style={[styles.copyIconLineSeparator, showCopyIcon ? null : styles.copyButtonLineSeparator]} />
      <View style={[styles.boxCopyIconWrapper, showCopyIcon ? null : styles.boxCopyButtonWrapper]}>
        <CustomButton
          onPress={copyToClipboard}
          style={[styles.copyIconContainer, showCopyIcon ? null : styles.copyButtonContainer]}
        >
          {showCopyIcon ? <Icon name="copy" size={copyIconSize} color={theme.colors.surface} /> : copyButtonText}
        </CustomButton>
        {showCopyIcon && (
          <Section.Text fontSize={10} fontWeight="medium" color={theme.colors.primary}>
            {copyButtonText}
          </Section.Text>
        )}
      </View>
    </Section>
  )
}

const styles = ({ theme }) => {
  const [height5, height40, height52] = [5, 40, 52].map(size => getDesignRelativeHeight(size, false))
  const width38 = getDesignRelativeWidth(38, false)
  const height25 = Math.ceil(height5 / 2)

  return {
    borderedBox: {
      borderWidth: 1,
      borderRadius: 5,
      display: 'flex',
      borerStyle: 'solid',
      alignItems: 'center',
      position: 'relative',
      justifyContent: 'center',
      borderColor: theme.colors.lighterGray,
      height: getDesignRelativeHeight(isBrowser ? 123 : 130, false),
    },
    boxTitle: {
      marginBottom: getDesignRelativeHeight(10, false),
    },
    avatarLineSeparator: {
      height: height5,
      top: -height25, // half of height
      backgroundColor: theme.colors.surface,
      position: 'absolute',
    },
    avatar: {
      position: 'absolute',
      zIndex: 1,
    },
    boxCopyIconWrapper: {
      width: getDesignRelativeWidth(88, false),
      height: height52,
      bottom: -Math.ceil(height52 / 2), // half of height
      position: 'absolute',
      zIndex: 1,
    },
    copyIconLineSeparator: {
      width: getDesignRelativeHeight(52, false),
      height: height5,
      bottom: -height25, // half of height
      backgroundColor: theme.colors.surface,
      position: 'absolute',
    },
    copyIconContainer: {
      width: width38,
      height: width38,
      minWidth: width38,
      borderRadius: Math.ceil(width38 / 2),
      backgroundColor: theme.colors.primary,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: getDesignRelativeHeight(4, false),
      marginRight: 'auto',
      marginLeft: 'auto',
    },
    boxCopyButtonWrapper: {
      width: getDesignRelativeWidth(174, false),
      height: getDesignRelativeHeight(54, false),
      bottom: -getDesignRelativeHeight(32, false), // half of height
    },
    copyButtonLineSeparator: {
      width: getDesignRelativeWidth(174, false),
    },
    copyButtonContainer: {
      width: getDesignRelativeWidth(160, false),
      height: height40,
      borderRadius: Math.ceil(height40 / 2),
    },
  }
}

export default withStyles(styles)(BorderedBox)
