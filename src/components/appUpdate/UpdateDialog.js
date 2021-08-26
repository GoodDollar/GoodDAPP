import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

import { RegularDialog } from '../common/dialogs/ServiceWorkerUpdatedDialog'
import useOnPress from '../../lib/hooks/useOnPress'
import { useDialog } from '../../lib/undux/utils/dialog'

import { theme } from '../theme/styles'

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

  const showUpdateDialog = useCallback(
    (onUpdateCallback, onOpenUrl) =>
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
      }),
    [showDialog],
  )

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
