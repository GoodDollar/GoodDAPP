// libraries
import React from 'react'
import { Image, View } from 'react-native'

// components
import { Icon, Section } from '../index'
import CustomButton from '../buttons/CustomButton'

// hooks
import useClipboard from '../../../lib/hooks/useClipboard'
import useOnPress from '../../../lib/hooks/useOnPress'

// utils
import { isBrowser } from '../../../lib/utils/platform'
import normalize from '../../../lib/utils/normalizeText'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { truncateMiddle } from '../../../lib/utils/string'

// assets
import UnknownProfileSVG from '../../../assets/unknownProfile.svg'

const copyIconSize = isBrowser ? 34 : normalize(24)

const BorderedBox = ({ styles, theme, imageSource, title, content, truncateContent = false, copyButtonText }) => {
  const [, setString] = useClipboard()
  const copyToClipboard = useOnPress(() => setString(content), [setString, content])
  const displayContent = truncateContent ? truncateMiddle(content, 29) : content // 29 = 13 chars left side + 3 chars of '...' + 13 chars right side

  return (
    <Section style={styles.borderedBox}>
      <View style={styles.avatarLineSeparator} />
      {imageSource ? (
        <Image source={{ uri: imageSource }} style={styles.avatar} />
      ) : (
        <View style={styles.avatar}>
          <UnknownProfileSVG />
        </View>
      )}
      <Section.Text fontSize={18} fontFamily="Roboto Slab" fontWeight="bold" style={styles.boxTitle}>
        {title}
      </Section.Text>
      <Section.Text fontSize={13} letterSpacing={0.07} color={theme.colors.lighterGray}>
        {displayContent}
      </Section.Text>
      <View style={styles.copyIconLineSeparator} />
      <View style={styles.boxCopyIconWrapper}>
        <CustomButton onPress={copyToClipboard} style={styles.copyIconContainer}>
          <Icon name="copy" size={copyIconSize} color={theme.colors.surface} />
        </CustomButton>
        <Section.Text fontSize={10} fontWeight="medium" color={theme.colors.primary}>
          {copyButtonText}
        </Section.Text>
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
    height: getDesignRelativeHeight(isBrowser ? 123 : 130, false),
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
    width: getDesignRelativeHeight(88, false),
    position: 'absolute',
    top: -getDesignRelativeHeight(2.5, false), // half of height
    backgroundColor: theme.colors.surface,
  },
  avatar: {
    height: getDesignRelativeHeight(68, false),
    width: getDesignRelativeHeight(68, false),
    borderRadius: getDesignRelativeHeight(34, false), // half of height/width
    top: -getDesignRelativeHeight(34, false), // half of height
    position: 'absolute',
    zIndex: 1,
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
    minWidth: getDesignRelativeHeight(38, false),
    borderRadius: getDesignRelativeHeight(19, false),
    backgroundColor: theme.colors.primary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getDesignRelativeHeight(4, false),
    marginRight: 'auto',
    marginLeft: 'auto',
  },
})

export default withStyles(styles)(BorderedBox)
