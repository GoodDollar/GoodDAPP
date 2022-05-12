// libraries
import React, { useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'

// components
import { noop } from 'lodash'
import { Section } from '../index'
import CustomButton from '../buttons/CustomButton'
import RoundIconButton from '../buttons/RoundIconButton'

// hooks
import { useClipboardCopy } from '../../../lib/hooks/useClipboard'

// utils
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { truncateMiddle } from '../../../lib/utils/string'
import ExportWarningPopup from '../../backupWallet/ExportWarningPopup'
import { useDialog } from '../../../lib/dialog/useDialog'

const copiedActionTimeout = 3000 // time during which the copy success message is displayed

const BorderedBox = ({
  styles,
  theme,
  image,
  imageSource,
  title,
  content,
  copyButtonText,
  children,
  truncateContent = false,
  imageSize = 68,
  enableSideMode = false,
  enableIndicateAction = false,
  showCopyIcon = true,
  onCopied = noop,
  disableCopy = false,
  overrideStyles = {},
  isDangerous = false,
}) => {
  // show the copy success message or no
  const [performed, setPerformed] = useState(false)
  const { showDialog, hideDialog } = useDialog()

  const _onCopied = useCallback(() => {
    enableIndicateAction && setPerformed(true)
    onCopied()
    enableIndicateAction && setTimeout(() => setPerformed(false), copiedActionTimeout)
  }, [enableIndicateAction, onCopied, setPerformed])

  const copyToClipboard = useClipboardCopy(content, _onCopied)
  const displayContent = truncateContent ? truncateMiddle(content, 29) : content // 29 = 13 chars left side + 3 chars of '...' + 13 chars right side

  const onDangerousCopyDismiss = useCallback(() => {
    _onCopied()
    hideDialog()
  }, [])

  const onDangerousCopy = useCallback(
    () =>
      showDialog({
        showButtons: false,
        onDismiss: noop,
        content: <ExportWarningPopup onDismiss={onDangerousCopyDismiss} />,
      }),
    [showDialog],
  )

  const handleCopy = useMemo(() => (isDangerous ? onDangerousCopy : copyToClipboard), [isDangerous])

  const avatarStyles = useMemo(() => {
    const [imageBoxSize, height25] = [imageSize, 25].map(size => getDesignRelativeHeight(size, true))
    const halfBoxSize = Math.ceil(imageBoxSize / 2)
    const positionStyle = enableSideMode
      ? {
          left: -halfBoxSize,
          top: height25,
        }
      : {
          top: -halfBoxSize,
        }

    return [
      styles.avatar,
      {
        width: imageBoxSize,
        height: imageBoxSize,
        borderRadius: halfBoxSize, // half of height/width
      },
      positionStyle,
    ]
  }, [imageSize, enableSideMode, styles.avatar])

  const lineSeparatorStyles = useMemo(
    () =>
      enableSideMode
        ? [
            styles.avatarLeftLineSeparator,
            {
              height: getDesignRelativeWidth(imageSize + 10, true),
            },
          ]
        : [
            styles.avatarTopLineSeparator,
            {
              width: getDesignRelativeWidth(imageSize + 20, true),
            },
          ],
    [imageSize, enableSideMode, styles.avatarTopLineSeparator, styles.avatarLeftLineSeparator],
  )

  const wrapperContainerStyles = useMemo(
    () =>
      enableSideMode && {
        marginHorizontal: getDesignRelativeWidth(imageSize / 2, true),
      },
  )

  const ImageComponent = image
  const [, imageStyle] = avatarStyles

  return (
    <View style={wrapperContainerStyles}>
      <Section.Stack style={[styles.borderedBox, enableSideMode && { borderRadius: 10 }]}>
        <View style={lineSeparatorStyles} />
        {image && (
          <View style={avatarStyles}>
            <ImageComponent style={imageStyle} />
          </View>
        )}
        <Section.Stack style={[enableSideMode ? styles.boxShortContent : styles.boxContent, overrideStyles.boxContent]}>
          <Section.Text
            fontSize={18}
            fontFamily={theme.fonts.slab}
            fontWeight="bold"
            style={[enableSideMode ? styles.boxShortTitle : styles.boxTitle, enableSideMode && styles.textAlignLeft]}
          >
            {title}
          </Section.Text>
          <Section.Text
            fontSize={13}
            letterSpacing={0.07}
            color={theme.colors.lighterGray}
            style={enableSideMode && styles.textAlignLeft}
          >
            {displayContent}
          </Section.Text>
          {children}
        </Section.Stack>
        {disableCopy ? null : (
          <View style={[styles.copyIconLineSeparator, showCopyIcon ? null : styles.copyButtonLineSeparator]} />
        )}
      </Section.Stack>
      {disableCopy ? null : (
        <View style={styles.boxCopyIconOuter}>
          <View style={[styles.boxCopyIconWrapper, showCopyIcon ? null : styles.boxCopyButtonWrapper]}>
            {showCopyIcon ? (
              <>
                <RoundIconButton onPress={handleCopy} iconSize={22} iconName="copy" style={styles.copyIconContainer} />
                <Section.Text fontSize={10} fontWeight="medium" color={theme.colors.primary}>
                  {copyButtonText}
                </Section.Text>
              </>
            ) : enableIndicateAction && performed ? (
              <CustomButton
                style={[styles.copyButtonContainer, styles.performedButtonStyle]}
                textStyle={styles.performedButtonText}
                disabled
              >
                Copied
              </CustomButton>
            ) : (
              <CustomButton onPress={handleCopy} style={styles.copyButtonContainer}>
                {copyButtonText}
              </CustomButton>
            )}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = ({ theme }) => {
  const [height5, height20, height40] = [5, 20, 40].map(size => getDesignRelativeHeight(size, true))
  const height25 = Math.ceil(height5 / 2)

  return {
    boxContent: {
      marginTop: getDesignRelativeHeight(35, false),
      marginBottom: getDesignRelativeHeight(35, false),
      padding: 0,
    },
    boxShortContent: {
      marginTop: getDesignRelativeHeight(20, false),
      marginBottom: getDesignRelativeHeight(30, false),
      width: '85%',
      padding: 0,
    },
    borderedBox: {
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 5,
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      justifyContent: 'center',
      borderColor: theme.colors.gray50Percent,
      padding: 0,
    },
    boxTitle: {
      marginBottom: getDesignRelativeHeight(8, true),
    },
    boxShortTitle: {
      marginBottom: getDesignRelativeHeight(4, true),
    },
    textAlignLeft: {
      textAlign: 'left',
    },
    avatarTopLineSeparator: {
      height: height5,
      top: -height25, // half of height
      backgroundColor: theme.colors.surface,
      position: 'absolute',
    },
    avatarLeftLineSeparator: {
      width: height5,
      backgroundColor: theme.colors.surface,
      left: -(height5 / 2), // half of line width
      top: height20,
      position: 'absolute',
    },
    avatar: {
      position: 'absolute',
      zIndex: 1,
      alignItems: 'center',
    },
    boxCopyIconOuter: {
      width: '100%',
      height: height40,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: -Math.ceil(height40 / 2), // half of height
      maxHeight: height40,
    },
    boxCopyIconWrapper: {
      width: getDesignRelativeWidth(88, false),
      height: height40,
    },
    copyIconLineSeparator: {
      width: getDesignRelativeWidth(52, false),
      height: height5,
      bottom: -height25, // half of height
      backgroundColor: theme.colors.surface,
      position: 'absolute',
    },
    copyIconContainer: {
      height: height40,
      maxHeight: height40,
      width: height40,
      minWidth: height40,
      borderRadius: Math.ceil(height40 / 2),
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
      height: height40,
    },
    copyButtonLineSeparator: {
      width: getDesignRelativeWidth(174, false),
    },
    copyButtonContainer: {
      width: getDesignRelativeWidth(160, false),
      height: height40,
      minHeight: height40,
      marginTop: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 0,
      marginRight: 'auto',
      marginLeft: 'auto',
      backgroundColor: theme.colors.primary,
    },
  }
}
export default withStyles(styles)(BorderedBox)
