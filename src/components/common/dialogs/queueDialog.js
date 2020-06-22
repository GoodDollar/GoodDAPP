//@flow

// libraries
import React, { useMemo } from 'react'
import { Image, View } from 'react-native'

// custom components
import Text from '../view/Text'

// utils
import { withStyles } from '../../../lib/styles'

// assets
import illustration from '../../../assets/Claim/claimQueue.svg'

export const DASHBOARD_TEXT_TYPE = 'dashboard'
export const FACE_VERIFICATION_TEXT_TYPE = 'face-verification'

const styles = () => ({
  wrapper: {
    flex: 1,
  },
  title: {
    borderColor: 'orange',
    borderBottomWidth: 2,
    borderTopWidth: 2,
    paddingTop: 10,
    paddingBottom: 10,
  },
  paddingTop20: {
    paddingTop: 20,
  },
  paddingVertical20: {
    paddingTop: 20,
    paddingBottom: 20,
  },
})

const commonTextProps = {
  textAlign: 'left',
  lineHeight: 22,
}

const DashboardTypeText = ({ styles }) => (
  <View style={styles.paddingVertical20}>
    <Text {...commonTextProps}>
      {`We’re still making sure our magic works as expected, which means there is a slight queue before you can start claiming G$’s.`}
    </Text>
    <Text {...commonTextProps} fontWeight="bold" style={styles.paddingTop20}>
      We’ll email you as soon as it’s your turn to claim.
    </Text>
  </View>
)

const FVTypeText = ({ styles }) => (
  <View style={styles.paddingVertical20}>
    <Text {...commonTextProps} fontSize={14}>
      <Text {...commonTextProps} fontSize={14} fontWeight="bold" style={styles.paddingTop20}>
        {'Since you’ve just deleted your wallet, '}
      </Text>
      you will have to wait 24 hours until you can claim.
    </Text>
    <Text {...commonTextProps} fontSize={14} style={styles.paddingTop20}>
      {'This is to prevent fraud and misuse.\nSorry for the inconvenience.'}
    </Text>
  </View>
)

const ClaimQueuePopup = ({ styles, type }) => {
  const TextComponent = useMemo(() => {
    switch (type) {
      case FACE_VERIFICATION_TEXT_TYPE:
        return FVTypeText

      case DASHBOARD_TEXT_TYPE:
      default:
        return DashboardTypeText
    }
  }, [type])

  return (
    <View style={styles.wrapper}>
      <View style={styles.title}>
        <Text textAlign="left" fontSize={22} lineHeight={28} fontWeight="medium">
          Good things come to those who wait...
        </Text>
      </View>
      <TextComponent styles={styles} />
    </View>
  )
}

const ClaimQueuePopupThemed = withStyles(styles)(ClaimQueuePopup)

export default (showDialog, type) => {
  const imageStyle = { marginRight: 'auto', marginLeft: 'auto', width: '33vh', height: '28vh' }

  showDialog({
    type: 'queue',
    isMinHeight: true,
    image: <Image source={illustration} style={imageStyle} resizeMode="contain" />,
    buttons: [
      {
        text: 'OK, Got it',
      },
    ],
    message: <ClaimQueuePopupThemed type={type} />,
  })
}
