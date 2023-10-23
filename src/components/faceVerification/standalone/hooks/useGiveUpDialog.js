import React, { useCallback, useContext } from 'react'
import { isUndefined, negate, pickBy } from 'lodash'

import { fireEvent, FV_GIVEUP } from '../../../../lib/analytics/analytics'
import AsyncStorage from '../../../../lib/utils/asyncStorage'
import { useDialog } from '../../../../lib/dialog/useDialog'
import GiveUpDialog from '../components/GiveUpDialog'
import { FVFlowContext } from '../context/FVFlowContext'
import { requestIdle } from '../../../../lib/utils/system'
import Config from '../../../../config/config'
import { openLink } from '../../../../lib/utils/linking'
import useFVRedirect from './useFVRedirect'

const useGiveUpDialog = (navigation, type) => {
  const { showDialog } = useDialog()
  const fvRedirect = useFVRedirect()
  const { isFVFlow } = useContext(FVFlowContext)
  const { navigate } = navigation
  const { fvTypeformUrl } = Config

  const onReasonChosen = useCallback(
    (reason = undefined) => {
      const data = pickBy({ reason }, negate(isUndefined))

      if (reason !== 'closed') {
        AsyncStorage.removeItem('hasStartedFV')
        fireEvent(FV_GIVEUP, { data, surveyType: type })
      }

      if (reason === 'Other') {
        openLink(fvTypeformUrl)
      }

      if (isFVFlow) {
        const redirect = () => fvRedirect(false, reason)

        requestIdle(redirect)
      } else {
        navigate('Home')
      }
    },
    [fvRedirect],
  )

  const onGiveUp = useCallback(() => {
    showDialog({
      content: <GiveUpDialog onReasonChosen={onReasonChosen} type={type} />,
      isMinHeight: false,
      showButtons: false,
      showCloseButtons: false,

      onDismiss: onReasonChosen,
    })
  }, [showDialog, onReasonChosen])

  return { onGiveUp }
}

export default useGiveUpDialog
