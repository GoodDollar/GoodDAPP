import React, { useCallback, useEffect, useMemo } from 'react'
import { useDialog } from '../../../lib/dialog/useDialog'
import RefundDialog from '../components/RefundDialog'
import { ACTION_SEND_TO_ADDRESS } from '../../dashboard/utils/sendReceiveFlow'
import useRefund from './useRefund'

const useRefundDialog = screenProps => {
  const [shouldRefund, refundAmount, claimAddress] = useRefund()
  const { showDialog, hideDialog } = useDialog()

  const params = useMemo(
    () => ({
      amount: refundAmount,
      address: claimAddress,
      action: ACTION_SEND_TO_ADDRESS,
      type: 'receive',
    }),
    [refundAmount, claimAddress],
  )

  const onRefund = useCallback(() => {
    hideDialog()
    screenProps.push('SendLinkSummary', params)
  }, [screenProps, hideDialog, params])

  useEffect(() => {
    if (!shouldRefund || !refundAmount) {
      return
    }

    showDialog({
      visible: true,
      type: 'success',
      isMinHeight: true,
      buttons: [
        {
          text: 'Return funds',
          textStyle: { fontWeight: '500' },
          style: { width: '100%' },
          onPress: onRefund,
        },
      ],
      content: <RefundDialog amount={refundAmount} />,
    })
  }, [showDialog, shouldRefund, refundAmount])
}

export default useRefundDialog
