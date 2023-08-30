import React, { useEffect, useRef } from 'react'

import { t } from '@lingui/macro'
import { RegularDialog } from '../common/dialogs/ServiceWorkerUpdatedDialog'
import { useDialog } from '../../lib/dialog/useDialog'
import { theme } from '../theme/styles'

export default () => {
  const { showDialog } = useDialog()
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
        showCloseButtons: true,
        content: <RegularDialog />,
        buttons: [
          {
            text: t`MAYBE LATER`,
            onPress: dismiss => dismiss(),
            style: { backgroundColor: 'none' },
            textStyle: { color: theme.colors.gray80Percent },
          },
          {
            text: t`UPDATE NOW`,
            onPress: onUpdateCallback,
          },
        ],
      })
  })()

  return updateDialogRef
}
