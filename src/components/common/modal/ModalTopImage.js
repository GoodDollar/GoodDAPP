// @flow
import React from 'react'
import { Image, View } from 'react-native'
import receiveIllustation from '../../../assets/Feed/receive.svg'
import sendIllustration from '../../../assets/Feed/send.svg'
import messageIllustration from '../../../assets/Feed/message.png'
import inviteIllustration from '../../../assets/Feed/invite.png'
import inviteFriendsIllustration from '../../../assets/Feed/inviteFriends.png'
import backupIllustration from '../../../assets/Feed/backup.png'
import spendingIllustration from '../../../assets/Feed/spending.svg'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'

const TopImage = ({ type, styles }) => {
  const getImageByType = () =>
    ({
      withdraw: {
        src: receiveIllustation,
        style: styles.mainImage,
        containerStyle: styles.mainImageContainer,
      },
      claim: {
        src: receiveIllustation,
        style: styles.mainImage,
        containerStyle: styles.mainImageContainer,
      },
      receive: {
        src: receiveIllustation,
        style: styles.mainImage,
        containerStyle: styles.mainImageContainer,
      },
      send: {
        src: sendIllustration,
        style: styles.mainImage,
        containerStyle: styles.mainImageContainer,
      },
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
      spending: {
        src: spendingIllustration,
        style: styles.spending,
        containerStyle: styles.mainPhotoContainer,
      },
    }[type] || null)

  const image = getImageByType()
  return (
    image && (
      <View style={image.containerStyle}>
        <Image style={image.style} source={image.src} />
      </View>
    )
  )
}

const getStylesFromProps = ({ theme }) => ({
  mainImageContainer: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 15,
  },
  mainImage: {
    height: getDesignRelativeHeight(110, false),
    width: getDesignRelativeWidth(70, false),
  },
  mainPhotoContainer: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 15,
  },
  mainPhoto: {
    height: '20vh',
    width: '100%',
  },
  spending: {
    width: getDesignRelativeWidth(176, false),
    height: getDesignRelativeHeight(76, false),
    margin: '10%',
  },
})

export default withStyles(getStylesFromProps)(TopImage)
