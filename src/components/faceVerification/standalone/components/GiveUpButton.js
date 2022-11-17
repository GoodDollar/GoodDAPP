import { t } from '@lingui/macro'
import React, { useCallback } from 'react'
import { isUndefined, negate, pickBy } from 'lodash'
import { useDialog } from '../../../../lib/dialog/useDialog'
import { withStyles } from '../../../../lib/styles'
import { CustomButton } from '../../../common'
import useFVRedirect from '../hooks/useFVRedirect'
import { fireEvent, FV_GIVEUP } from '../../../../lib/analytics/analytics'
import GiveUpDialog from './GiveUpDialog'

const GiveUpButton = () => {
  const { showDialog } = useDialog()
  const fvRedirect = useFVRedirect()

  const onReasonChosen = useCallback(
    (reason = undefined) => {
      const data = pickBy({ reason }, negate(isUndefined))

      fireEvent(FV_GIVEUP, data)

      // await before analytics scripts will perform some activity
      window.requestIdleCallback(() => fvRedirect(false, reason))
    },
    [fvRedirect],
  )

  const onGiveUp = useCallback(() => {
    showDialog({
      content: <GiveUpDialog onReasonChosen={onReasonChosen} />,
      isMinHeight: false,
      showButtons: false,
      onDismiss: onReasonChosen,
    })
  }, [showDialog, onReasonChosen])

  return <CustomButton onPress={onGiveUp}>{t`I give up`}</CustomButton>
}

const getStylesFromProps = ({ theme }) => ({})

export default withStyles(getStylesFromProps)(GiveUpButton)
