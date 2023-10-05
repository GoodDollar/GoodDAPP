import { get, noop } from 'lodash'
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react'
import { t } from '@lingui/macro'

import logger from '../../../../lib/logger/js-logger'
import API from '../../../../lib/API'
import { useDialog } from '../../../../lib/dialog/useDialog'
import LoadingIcon from '../../../common/modal/LoadingIcon'
import Captcha from './Recaptcha'

const log = logger.child({ from: 'recaptcha' })

const Recaptcha = React.forwardRef(({ onSuccess = noop, onFailure = noop, children }, ref) => {
  const captchaRef = useRef()
  const { showDialog, hideDialog } = useDialog()
  const [isPassed, setIsPassed] = useState(false)

  const onVerify = useCallback(
    async (payload, ekey) => {
      let result
      let hasPassed = false
      const captchaType = captchaRef.current.type?.() || 'recaptcha'
      const title = t`Verifying CAPTCHA`

      try {
        showDialog({ title, image: <LoadingIcon />, showCloseButtons: false, showButtons: false })

        log.debug('Recaptcha payload', { payload, ekey, captchaType })

        result = await API.verifyCaptcha({ payload, captchaType })
        hasPassed = get(result, 'success', false)
        log.debug('Recaptcha verify result', { result, hasPassed })
      } catch (exception) {
        const { message } = exception
        const errorCtx = { payload, ekey, captchaType, result }

        log.error('recaptcha verification failed', message, exception, errorCtx)
      }

      hideDialog()

      if (!hasPassed) {
        onFailure()
        return
      }

      setIsPassed(true)
      onSuccess()
    },
    [setIsPassed, onSuccess, onFailure],
  )

  useImperativeHandle(
    ref,
    () => ({
      hasPassedCheck: () => isPassed,
      launchCheck: () => {
        if (isPassed) {
          return
        }

        captchaRef.current.launch()
      },
    }),
    [isPassed],
  )

  return (
    <Captcha ref={captchaRef} onError={onFailure} onVerify={onVerify}>
      {children}
    </Captcha>
  )
})

export default Recaptcha
