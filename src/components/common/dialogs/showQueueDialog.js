//@flow

// libraries
import React from 'react'
import { Image, View } from 'react-native'

// custom components
import Text from '../view/Text'

import { store } from '../../../lib/undux/SimpleStore'
import { showDialogWithData } from '../../../lib/undux/utils/dialog'

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
  textStyle: {
    textAlign: 'left',
    lineHeight: 22,
  },
  boldFont: {
    fontWeight: 'bold',
  },
})

const QueuePopup = withStyles(styles)(({ styles, textComponent }) => {
  const TextComponent = textComponent

  return (
    <View style={styles.wrapper}>
      <View style={styles.title}>
        <Text textAlign="left" fontSize={22} lineHeight={28} fontWeight="medium">
          You’re in the queue to start Claiming GoodDollars!
        </Text>
      </View>
      <TextComponent styles={styles} />
    </View>
  )
})

export const showQueueDialog = (textComponent, dialogOptions = {}) => {
  const imageStyle = { marginRight: 'auto', marginLeft: 'auto', width: '33vh', height: '28vh' }

  showDialogWithData(store.getCurrentSnapshot(), {
    type: 'queue',
    isMinHeight: true,
    image: <Image source={illustration} style={imageStyle} resizeMode="contain" />,
    message: <QueuePopup textComponent={textComponent} />,
    buttons: [
      {
        text: 'OK, I’ll WAIT',
      },
    ],
    ...dialogOptions,
  })
}
