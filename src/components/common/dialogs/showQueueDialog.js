//@flow

// libraries
import React, { useCallback } from 'react'
import { Image, View } from 'react-native'

// custom components
import Text from '../view/Text'

import { useDialog } from '../../../lib/undux/utils/dialog'

// utils
import { withStyles } from '../../../lib/styles'

// assets
import illustration from '../../../assets/Claim/claimQueue.svg'

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

const textStyles = {
  textAlign: 'left',
  lineHeight: 22,
}

const QueuePopup = withStyles(styles)(({ styles, textComponent }) => {
  const TextComponent = textComponent

  return (
    <View style={styles.wrapper}>
      <View style={styles.title}>
        <Text textAlign="left" fontSize={22} lineHeight={28} fontWeight="medium">
          Good things come to those who wait...
        </Text>
      </View>
      <TextComponent styles={styles} textStyle={textStyles} />
    </View>
  )
})

export const showQueueDialog = (showDialog, textComponent, dialogOptions = {}) => {
  const imageStyle = { marginRight: 'auto', marginLeft: 'auto', width: '33vh', height: '28vh' }

  showDialog({
    type: 'queue',
    isMinHeight: true,
    image: <Image source={illustration} style={imageStyle} resizeMode="contain" />,
    message: <QueuePopup textComponent={textComponent} />,
    buttons: [
      {
        text: 'OK, Got it',
      },
    ],
    ...dialogOptions,
  })
}

export const useQueueDialog = (textComponent, dialogOptions = {}) => {
  const [showDialog] = useDialog()

  return useCallback(() => showQueueDialog(showDialog, textComponent, dialogOptions), [showDialog, dialogOptions])
}
