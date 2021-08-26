import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useDialog } from '../undux/utils/dialog'
import { RegularDialog } from '../../components/common/dialogs/ServiceWorkerUpdatedDialog'
import { theme } from '../../components/theme/styles'
import useOnPress from './useOnPress'

const WhatsNewButtonComponent = ({ onOpenUrl }) => {
  const handlePress = useOnPress(() => onOpenUrl())

  return (
    <TouchableOpacity onPress={handlePress} style={styles.serviceWorkerDialogWhatsNew}>
      <Text fontSize={14} lineHeight={20} fontWeight="medium" color="gray80Percent">
        WHAT’S NEW?
      </Text>
    </TouchableOpacity>
  )
}

export default () => {
  const [showDialog] = useDialog()

  const showUpdateDialog = (onUpdateCallback, onOpenUrl) =>
    showDialog({
      showCloseButtons: false,
      content: <RegularDialog />,
      buttonsContainerStyle: styles.serviceWorkerDialogButtonsContainer,
      buttons: [
        {
          mode: 'custom',
          Component: () => <WhatsNewButtonComponent onOpenUrl={onOpenUrl} />,
        },
        {
          text: 'UPDATE',
          onPress: onUpdateCallback,
        },
      ],
    })

  return [showUpdateDialog]
}

const styles = StyleSheet.create({
  serviceWorkerDialogButtonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.sizes.defaultDouble,
    justifyContent: 'space-between',
  },
  serviceWorkerDialogWhatsNew: {
    justifyContent: 'center',
  },
})
