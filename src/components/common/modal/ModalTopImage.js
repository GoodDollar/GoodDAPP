// @flow
import React from 'react'
import { Image, View } from 'react-native'
import messageIllustration from '../../../assets/Feed/message.png'
import inviteIllustration from '../../../assets/Feed/invite.png'
import ClaimSVG from '../../../assets/Feed/IllustrationsMenHero.svg' // eslint-disable-line
import inviteFriendsIllustration from '../../../assets/Feed/inviteFriends.png'
import backupIllustration from '../../../assets/Feed/backup.png'
import SpendingSVG from '../../../assets/Feed/spending.svg'
import ClaimingSVG from '../../../assets/Feed/claiming.svg'
import HanukaStartsSVG from '../../../assets/Feed/hanukaStarts.svg'
import ReceivedAnimation from '../../common/animations/Received'
import SendAnimation from '../../common/animations/Send'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'

export const getImageByType = (type, styles = {}) =>
  ({
    // animated components
    withdraw: {
      Component: ReceivedAnimation,
      containerStyle: styles.mainImageContainer,
    },
    sendcompleted: {
      Component: SendAnimation,
      containerStyle: styles.mainImageContainer,
    },
    claim: {
      Component: ReceivedAnimation,
      containerStyle: styles.mainImageContainer,
    },
    bonuscompleted: {
      Component: ReceivedAnimation,
      containerStyle: styles.mainImageContainer,
    },

    // svg images
    claiming: {
      Component: ClaimingSVG,
      containerStyle: styles.mainSVGContainer,
      subContainerStyle: styles.claiming,
    },
    claimsThreshold: {
      Component: ClaimSVG,
      containerStyle: styles.mainSVGContainer,
      subContainerStyle: styles.claim,
    },
    spending: {
      Component: SpendingSVG,
      containerStyle: styles.mainSVGContainer,
      subContainerStyle: styles.spending,
    },
    hanukaStarts: {
      Component: HanukaStartsSVG,
      containerStyle: styles.mainSVGContainer,
      subContainerStyle: styles.hanukaStarts,
    },

    // below illustrations is a png images and should be rendered with Image component
    message: {
      src: messageIllustration,
      style: styles.mainPhoto,
      containerStyle: styles.mainPhotoContainer,
    },
    invite: {
      src: inviteFriendsIllustration,
      style: styles.mainPhoto,
      containerStyle: styles.mainPhotoContainer,
    },
    welcome: {
      src: inviteIllustration,
      style: styles.mainPhoto,
      containerStyle: styles.mainPhotoContainer,
    },
    backup: {
      src: backupIllustration,
      style: styles.mainPhoto,
      containerStyle: styles.mainPhotoContainer,
    },
  }[type] || null)

const TopImage = ({ type, styles }) => {
  const image = getImageByType(type, styles)

  if (image) {
    const { Component, src, containerStyle, subContainerStyle, style } = image

    return Component ? (
      <View style={[containerStyle]}>
        {subContainerStyle ? (
          <View style={subContainerStyle}>
            <Component style={style} />
          </View>
        ) : (
          <Component style={style} />
        )}
      </View>
    ) : (
      <View style={containerStyle}>
        <Image style={style} source={src} />
      </View>
    )
  }

  return null
}

const getStylesFromProps = ({ theme }) => ({
  mainSVGContainer: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: getDesignRelativeHeight(30),
  },
  mainImageContainer: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 30,
  },
  mainPhotoContainer: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 30,
  },
  mainImage: {
    height: getDesignRelativeHeight(110, true),
    width: getDesignRelativeWidth(70, true),
  },
  mainPhoto: {
    height: '20vh',
    width: '100%',
  },
  claim: {
    marginTop: getDesignRelativeHeight(30),
    width: getDesignRelativeWidth(200),
    height: getDesignRelativeWidth(200),
  },
  spending: {
    width: getDesignRelativeWidth(176),
    height: getDesignRelativeHeight(76),
    margin: '10%',
  },
  claiming: {
    width: getDesignRelativeHeight(92),
    height: getDesignRelativeHeight(92),
    margin: getDesignRelativeHeight(20),
  },
  hanukaStarts: {
    width: getDesignRelativeHeight(190),
    height: getDesignRelativeHeight(115),
    margin: getDesignRelativeHeight(10),
  },
})

export default withStyles(getStylesFromProps)(TopImage)
