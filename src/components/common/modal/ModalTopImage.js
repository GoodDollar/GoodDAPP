// @flow
import React from 'react'
import { Image, Platform, View } from 'react-native'
import ReceiveSVG from '../../../assets/Feed/receive.svg'
import SendSVG from '../../../assets/Feed/send.svg'
import MessagePNG from '../../../assets/Feed/message.png'
import InvitePNG from '../../../assets/Feed/invite.png'
import InviteFriendsPNG from '../../../assets/Feed/inviteFriends.png'
import BackupPNG from '../../../assets/Feed/backup.png'
import SpendingSVG from '../../../assets/Feed/spending.svg'
import ClaimingSVG from '../../../assets/Feed/claiming.svg'
import HanukaStartsSVG from '../../../assets/Feed/hanukaStarts.svg'
import ReceivedAnimation from '../../common/animations/Received'
import SendAnimation from '../../common/animations/Send'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'

const mainPhotoStyles = {
  web: {
    height: '20vh',
    width: '100%',
  },
  ios: {
    height: getDesignRelativeHeight(175, true),
    width: '100%',
  },
  android: {
    height: getDesignRelativeHeight(175, true),
    width: '100%',
  },
}

export const getImageByType = (type, styles = {}) =>
  ({
    withdraw: {
      animationComponent: ReceivedAnimation,
      animation: true,
      containerStyle: styles.mainImageContainer,
    },
    sendcompleted: {
      animationComponent: SendAnimation,
      animation: true,
      containerStyle: styles.mainImageContainer,
    },
    claim: {
      animationComponent: ReceivedAnimation,
      animation: true,
      containerStyle: styles.mainImageContainer,
    },
    claiming: {
      svgSrc: ClaimingSVG,
      style: styles.claiming,
      containerStyle: styles.mainImageContainer,
    },
    bonuscompleted: {
      animationComponent: ReceivedAnimation,
      animation: true,
      containerStyle: styles.mainImageContainer,
    },
    receive: {
      svgSrc: ReceiveSVG,
      style: styles.mainImage,
      containerStyle: styles.mainImageContainer,
    },
    send: {
      svgSrc: SendSVG,
      style: styles.mainImage,
      containerStyle: styles.mainImageContainer,
    },
    message: {
      imageSrc: MessagePNG,
      style: styles.mainPhoto,
      containerStyle: styles.mainPhotoContainer,
    },
    invite: {
      imageSrc: InviteFriendsPNG,
      style: styles.mainPhoto,
      containerStyle: styles.mainPhotoContainer,
    },
    welcome: {
      imageSrc: InvitePNG,
      style: styles.mainPhoto,
      containerStyle: styles.mainPhotoContainer,
    },
    backup: {
      imageSrc: BackupPNG,
      style: styles.mainPhoto,
      containerStyle: styles.mainPhotoContainer,
    },
    spending: {
      svgSrc: SpendingSVG,
      style: styles.spending,
      containerStyle: styles.mainPhotoContainer,
    },
    hanukaStarts: {
      svgSrc: HanukaStartsSVG,
      style: styles.hanukaStarts,
      containerStyle: styles.mainImageContainer,
    },
  }[type] || null)

const TopImage = ({ type, styles }) => {
  const ImageData = getImageByType(type, styles)

  if (ImageData) {
    return (
      <View style={ImageData.containerStyle}>
        {!!ImageData.animation && <ImageData.animationComponent />}
        {!!ImageData.imageSrc && <Image style={ImageData.style} source={ImageData.imageSrc} />}
        {!!ImageData.svgSrc && (
          <View style={ImageData.style}>
            <ImageData.svgSrc />
          </View>
        )}
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
    marginBottom: 15,
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
    marginBottom: 15,
  },
  mainPhoto: Platform.select(mainPhotoStyles),
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
