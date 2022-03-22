import React, { useEffect, useRef } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

import { Trans as _ } from '@lingui/macro'
import { RegularDialog } from '../common/dialogs/ServiceWorkerUpdatedDialog'
import useOnPress from '../../lib/hooks/useOnPress'
import { useDialog } from '../../lib/undux/utils/dialog'

import { theme } from '../theme/styles'

const WhatsNewButtonComponent = ({ onOpenUrl }) => {
  const handlePress = useOnPress(() => onOpenUrl())

  return (
    <TouchableOpacity onPress={handlePress} style={styles.serviceWorkerDialogWhatsNew}>
      <Text fontSize={14} lineHeight={20} fontWeight="medium" color="gray80Percent">
        <_>WHAT’S NEW?</_>
      </Text>
    </TouchableOpacity>
  )
}

export default () => {
  const [showDialog] = useDialog()
  const showDialogRef = useRef(showDialog)
  const updateDialogRef = useRef()

  // keep showDialog ref up to date
  useEffect(() => void (showDialogRef.current = showDialog), [showDialog])

  // inline functions outside effects are allowed if we're accessing refs only
  // https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
  ;(() => {
    if (updateDialogRef.current) {
      return
    }

    updateDialogRef.current = (onUpdateCallback, onOpenUrl) =>
      showDialogRef.current({
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
  })()

  return updateDialogRef
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
