// @flow
import React from 'react'
import { Image, View } from 'react-native'
import receiveIllustation from '../../../assets/Feed/receive.svg'
import sendIllustration from '../../../assets/Feed/send.svg'
import messageIllustration from '../../../assets/Feed/message.png'
import inviteIllustration from '../../../assets/Feed/invite.png'
import { withStyles } from '../../../lib/styles'

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
        src: inviteIllustration,
        style: styles.mainPhoto,
        containerStyle: styles.mainPhotoContainer,
      },
      welcome: {
        src: inviteIllustration,
        style: styles.mainPhoto,
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
    height: 110,
    width: 70,
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
})

export default withStyles(getStylesFromProps)(TopImage)
