import { noop } from 'lodash'
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { t } from '@lingui/macro'
import { useDialog } from '../../../../lib/dialog/useDialog'
import logger from '../../../../lib/logger/js-logger'
import Config from '../../../../config/config'
import Recaptcha from '.'

const log = logger.child({ from: 'useRecaptcha' })

const useRecaptcha = options => {
  const { onSuccess = noop, onFailed = noop, autoLaunch = true, relaunchOnFailed = true, enabled = true } =
    options || {}

  const reCaptchaRef = useRef()
  const { showErrorDialog } = useDialog()
  const isEnabled = Config.env !== 'development' && enabled
  const [isValidRecaptcha, setValidRecaptcha] = useState(false)

  const onRecaptchaSuccess = useCallback(() => {
    log.debug('Recaptcha successfull')
    setValidRecaptcha(true)
    onSuccess()
  }, [setValidRecaptcha, onSuccess])

  const launchCaptcha = useCallback(() => {
    const { current: captcha } = reCaptchaRef

    log.debug('recaptcha launch', { captcha })

    // If recaptcha has already been passed successfully, trigger torus right away
    if (!isEnabled || (captcha && captcha.hasPassedCheck())) {
      onRecaptchaSuccess()
      return
    }

    if (!captcha) {
      return
    }

    log.debug('recaptcha launch, launching...', { captcha })
    captcha.launchCheck()
  }, [onRecaptchaSuccess])

  const onRecaptchaFailed = useCallback(() => {
    log.debug('Recaptcha failed')

    showErrorDialog('', '', {
      title: t`CAPTCHA test failed`,
      message: t`Please try again.`,
      onDismiss: reason => {
        onFailed()

        if (relaunchOnFailed && reason !== 'closed') {
          launchCaptcha()
        }
      },
    })
  }, [launchCaptcha, showErrorDialog, onFailed, relaunchOnFailed, isEnabled])

  const Captcha = useMemo(
    () =>
      !isEnabled
        ? Fragment
        : ({ children }) => (
            <Recaptcha ref={reCaptchaRef} onSuccess={onRecaptchaSuccess} onFailure={onRecaptchaFailed}>
              {children}
            </Recaptcha>
          ),
    [onRecaptchaSuccess, onRecaptchaFailed, isEnabled],
  )

  useEffect(() => {
    if (!autoLaunch || isValidRecaptcha) {
      return
    }

    launchCaptcha()
  }, [autoLaunch, isValidRecaptcha, launchCaptcha])

  return { Captcha, isValidRecaptcha, launchCaptcha }
}

export default useRecaptcha
