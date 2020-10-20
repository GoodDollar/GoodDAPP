// libraries
import React, { useMemo } from 'react'
import { Image, Platform, View } from 'react-native'

// components
import { isString, noop } from 'lodash'
import { Icon, Section } from '../index'
import CustomButton from '../buttons/CustomButton'

// hooks
import useClipboard from '../../../lib/hooks/useClipboard'
import useOnPress from '../../../lib/hooks/useOnPress'

// utils
import { isWeb } from '../../../lib/utils/platform'
import normalize from '../../../lib/utils/normalizeText'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { truncateMiddle } from '../../../lib/utils/string'

const copyIconSize = isWeb ? 34 : normalize(21)

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
  const halfImageSize = useMemo(() => Math.floor(imageSize / 2), [imageSize])
  const ImageComponent = imageSource

  const copyToClipboard = useOnPress(() => {
    setString(content)
    onCopied()
  }, [onCopied, setString, content])

  const avatarStyles = useMemo(
    () => [
      styles.avatar,
      {
        height: getDesignRelativeHeight(imageSize, false),
        width: getDesignRelativeWidth(imageSize, false),
        borderRadius: getDesignRelativeHeight(halfImageSize, false), // half of height/width
        top: -getDesignRelativeHeight(halfImageSize, false), // half of height
      },
    ],
    [imageSize, styles.avatar],
  )

  const lineSeparatorStyles = useMemo(
    () => [
      styles.avatarLineSeparator,
      {
        width: getDesignRelativeHeight(imageSize + 20, false),
      },
    ],
    [imageSize, styles.avatarLineSeparator],
  )

  return (
    <Section style={styles.borderedBox}>
      <View style={lineSeparatorStyles} />
      {isString(imageSource) ? (
        <Image source={{ uri: imageSource }} style={avatarStyles} />
      ) : (
        <View style={avatarStyles}>
          <ImageComponent />
        </View>
      )}
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

const styles = ({ theme }) => ({
  borderedBox: {
    borderWidth: 1,
    borerStyle: 'solid',
    borderColor: theme.colors.lighterGray,
    borderRadius: 5,
    height: getDesignRelativeHeight(isWeb ? 123 : 130, false),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  boxTitle: {
    marginBottom: getDesignRelativeHeight(10, false),
  },
  avatarLineSeparator: {
    height: getDesignRelativeHeight(5, false),
    position: 'absolute',
    top: -getDesignRelativeHeight(2.5, false), // half of height
    backgroundColor: theme.colors.surface,
  },
  avatar: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
  },
  boxCopyIconWrapper: {
    height: getDesignRelativeHeight(52, false),
    width: getDesignRelativeHeight(88, false),
    position: 'absolute',
    bottom: -getDesignRelativeHeight(26, false), // half of height
    zIndex: 1,
  },
  copyIconLineSeparator: {
    height: getDesignRelativeHeight(5, false),
    width: getDesignRelativeHeight(52, false),
    position: 'absolute',
    bottom: -getDesignRelativeHeight(2.5, false), // half of height
    backgroundColor: theme.colors.surface,
  },
  copyIconContainer: {
    height: getDesignRelativeHeight(38, false),
    width: getDesignRelativeHeight(38, false),
    minWidth: Platform.select({
      web: getDesignRelativeHeight(38, false),
      default: getDesignRelativeHeight(42, false),
    }),
    borderRadius: Platform.select({
      web: getDesignRelativeHeight(19, false),
      default: getDesignRelativeHeight(21, false),
    }),
    backgroundColor: theme.colors.primary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getDesignRelativeHeight(4, false),
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  boxCopyButtonWrapper: {
    width: getDesignRelativeHeight(174, false),
    height: getDesignRelativeHeight(54, false),
    bottom: -getDesignRelativeHeight(32, false), // half of height
  },
  copyButtonLineSeparator: {
    width: getDesignRelativeHeight(174, false),
  },
  copyButtonContainer: {
    height: getDesignRelativeHeight(40, false),
    width: getDesignRelativeHeight(160, false),
    borderRadius: getDesignRelativeHeight(20, false),
  },
})

export default withStyles(styles)(BorderedBox)
