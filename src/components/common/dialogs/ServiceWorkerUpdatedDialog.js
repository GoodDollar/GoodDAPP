// libraries
import React from 'react'
import { Platform, View } from 'react-native'

// components
import { Trans as _, t } from '@lingui/macro'
import Text from '../../common/view/Text'
import JumpingPeopleAnimation from '../animations/JumpingPeople'

// utils
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth, isSmallDevice } from '../../../lib/utils/sizes'
import { isBrowser } from '../../../lib/utils/platform'

// assets
import UpdateVersionSVG from '../../../assets/updateversion.svg'

// localization

const dialogStyles = ({ theme }) => {
  const topPosition = isBrowser ? 0 : isSmallDevice ? 40 : 80

  const animation = {
    height: getDesignRelativeHeight(144),
    width: getDesignRelativeHeight(279),
    marginBottom: getDesignRelativeHeight(45),
    position: 'relative',
    top: getDesignRelativeHeight(topPosition),
  }

  return {
    animation,
    image: {
      textAlign: 'center',
      height: getDesignRelativeHeight(134),
      width: getDesignRelativeHeight(191),
      marginBottom: getDesignRelativeHeight(25),
      justifyContent: 'center',
    },
    imageContainer: {
      paddingTop: getDesignRelativeHeight(32),
      display: 'flex',
      alignItems: 'center',
    },
    phase1Title: {
      ...Platform.select({
        web: { borderTopStyle: 'solid' },
      }),
      borderTopWidth: 2,
      borderTopColor: theme.colors.primary,
      paddingTop: getDesignRelativeWidth(9),
    },
    title: {
      width: '100%',
      paddingBottom: getDesignRelativeWidth(9),
      marginBottom: getDesignRelativeWidth(9),
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
      ...Platform.select({
        web: { borderBottomStyle: 'solid' },
      }),
    },
    description: {
      minHeight: getDesignRelativeWidth(100),
    },
  }
}

export const RegularDialog = withStyles(dialogStyles)(({ styles, theme }) => (
  <View>
    <View style={styles.imageContainer}>
      <View style={styles.image}>
        <UpdateVersionSVG />
      </View>
      <Text
        fontSize={22}
        lineHeight={26}
        textAlign="left"
        fontWeight="bold"
        color={theme.colors.darkGray}
        style={styles.title}
      >
        {t`Hip hip hooray!\nWe have a new version :)`}
      </Text>
    </View>
    <View style={styles.description}>
      <Text fontSize={14} lineHeight={20} textAlign="left" color={theme.colors.darkGray}>
        <_>
          Thanks to your awesome feedback we were able to improve our wallet. We hope now you’ll enjoy it even more.
        </_>
      </Text>
    </View>
  </View>
))

export const NewReleaseDialog = withStyles(dialogStyles)(({ styles, theme }) => {
  const textStyles = { fontSize: 14, lineHeight: isSmallDevice ? 30 : 26 }

  return (
    <View>
      <View style={styles.imageContainer}>
        <View style={styles.animation}>
          <JumpingPeopleAnimation />
        </View>
        <Text
          fontSize={26}
          lineHeight={38}
          textAlign="left"
          fontWeight="bold"
          color={theme.colors.green}
          style={[styles.title, styles.phase1Title]}
        >
          <_>Good News: We’re Live!</_>
        </Text>
      </View>
      <View style={styles.description}>
        <Text {...textStyles} textAlign="left" color={theme.colors.darkGray}>
          <Text {...textStyles} fontWeight="bold">
            1.
          </Text>
          {t` Click ‘update’\n`}
          <Text {...textStyles} fontWeight="bold">
            2.
          </Text>
          {t` Sign up (one last time, we promise ${isSmallDevice ? '' : ':)'})\n`}
          <Text {...textStyles} fontWeight="bold">
            3.
          </Text>
          {t` Start claiming your free, REAL G$’s`}
        </Text>
      </View>
    </View>
  )
})
