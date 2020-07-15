import { store } from '../../../../lib/undux/SimpleStore'
import { showDialogWithData } from '../../../../lib/undux/utils/dialog'

export default () => {
  const storeSnapshot = store.getCurrentSnapshot()

  showDialogWithData(storeSnapshot, {
    type: 'error',
    isMinHeight: false,
    message: "We couldn't start face verification,\nplease reload the app.",
    onDismiss: () => window.location.reload(true),
    buttons: [
      {
        text: 'REFRESH',
      },
    ],
  })
}
