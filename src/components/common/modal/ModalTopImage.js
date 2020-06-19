// @flow

// libraries
import React from 'react'
import { Image, View } from 'react-native'

// utils
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { isWeb } from '../../../lib/utils/platform'

// animated illustrations (animations)
import ReceivedAnimation from '../../common/animations/Received'
import SendAnimation from '../../common/animations/Send'

// assets
// svg illustrations
import receiveIllustation from '../../../assets/Feed/receive.svg'
import sendIllustration from '../../../assets/Feed/send.svg'
import claimIllustration from '../../../assets/Feed/IllustrationsMenHero.svg' // eslint-disable-line
import spendingIllustration from '../../../assets/Feed/spending.svg'
import claimingIllustration from '../../../assets/Feed/claiming.svg'
import hanukaStartsIllustration from '../../../assets/Feed/hanukaStarts.svg'

// png illustrations
import messageIllustration from '../../../assets/Feed/message.png'
import inviteIllustration from '../../../assets/Feed/invite.png'
import inviteFriendsIllustration from '../../../assets/Feed/inviteFriends.png'
import backupIllustration from '../../../assets/Feed/backup.png'

if (isWeb) {
  Image.prefetch(messageIllustration)
  Image.prefetch(inviteIllustration)
  Image.prefetch(inviteFriendsIllustration)
  Image.prefetch(backupIllustration)
}

export const getImageByType = (type, styles = {}) =>
  ({
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
    claiming: {
      Component: claimingIllustration,
      style: styles.claiming,
      containerStyle: styles.mainImageContainer,
    },
    bonuscompleted: {
      Component: ReceivedAnimation,
      containerStyle: styles.mainImageContainer,
    },
    receive: {
      Component: receiveIllustation,
      style: styles.mainImage,
      containerStyle: styles.mainImageContainer,
    },
    send: {
      Component: sendIllustration,
      style: styles.mainImage,
      containerStyle: styles.mainImageContainer,
    },
    claimsThreshold: {
      Component: claimIllustration,
      style: styles.claimIllustration,
      containerStyle: styles.mainPhotoContainer,
    },
    spending: {
      Component: spendingIllustration,
      style: styles.spending,
      containerStyle: styles.mainPhotoContainer,
    },
    hanukaStarts: {
      Component: hanukaStartsIllustration,
      style: styles.hanukaStarts,
      containerStyle: styles.mainImageContainer,
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
    const { Component, src, containerStyle, style } = image

    return Component ? (
      <View style={containerStyle}>
        <Component style={style} />
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
  mainImageContainer: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 30,
  },
  mainImage: {
    height: getDesignRelativeHeight(110, true),
    width: getDesignRelativeWidth(70, true),
  },
  mainPhotoContainer: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: -theme.sizes.defaultDouble,
    marginTop: -theme.sizes.defaultDouble,
    marginBottom: 30,
  },
  mainPhoto: {
    height: '20vh',
    width: '100%',
  },
  claimIllustration: {
    marginTop: getDesignRelativeHeight(30),
    height: '24vh',
    width: '60%',
  },
  spending: {
    width: getDesignRelativeWidth(176),
    height: getDesignRelativeHeight(76),
    margin: '10%',
  },
  claiming: {
    width: getDesignRelativeHeight(92),
    height: getDesignRelativeHeight(92),
    margin: 20,
  },
  hanukaStarts: {
    width: getDesignRelativeHeight(190),
    height: getDesignRelativeHeight(115),
    margin: 10,
  },
})

export default withStyles(getStylesFromProps)(TopImage)
