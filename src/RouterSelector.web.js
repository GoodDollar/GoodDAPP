// libraries
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AsyncStorage, StyleSheet } from 'react-native'
import bip39 from 'bip39-light'

// components
import Splash from './components/splash/Splash'
import ServiceWorkerUpdatedDialog from './components/dashboard/ServiceWorkerUpdatedDialog'

// hooks
import { useDialog } from './lib/undux/utils/dialog'

// utils
import { DESTINATION_PATH } from './lib/constants/localStorage'
import SimpleStore from './lib/undux/SimpleStore'
import { delay } from './lib/utils/async'
import retryImport from './lib/utils/retryImport'
import { extractQueryParams } from './lib/share/index'
import logger from './lib/logger/pino-logger'
import { fireEvent, initAnalytics, SIGNIN_FAILED, SIGNIN_SUCCESS } from './lib/analytics/analytics'
import Config from './config/config'
import { theme } from './components/theme/styles'
import normalize from './lib/utils/normalizeText'

const log = logger.child({ from: 'RouterSelector' })

// import Router from './SignupRouter'
let SignupRouter = React.lazy(async () => {
  await initAnalytics()

  const [module] = await Promise.all([
    retryImport(() => import(/* webpackChunkName: "signuprouter" */ './SignupRouter')),
    handleLinks(),
    delay(5000),
  ])

  return module
})

/**
 * handle in-app links for unsigned users such as magiclink and paymentlinks
 * magiclink proceed to signin other links we keep and pop once user is logged in
 *
 * @returns {Promise<boolean>}
 */
const handleLinks = async () => {
  const decodedHref = decodeURI(window.location.href)
  const params = extractQueryParams(decodedHref)

  try {
    const { magiclink } = params
    if (magiclink) {
      let userNameAndPWD = Buffer.from(decodeURIComponent(magiclink), 'base64').toString()
      let userNameAndPWDArray = userNameAndPWD.split('+')
      log.debug('recoverByMagicLink', { magiclink, userNameAndPWDArray })
      if (userNameAndPWDArray.length === 2) {
        const userName = userNameAndPWDArray[0]
        const userPwd = userNameAndPWDArray[1]
        const UserStorage = await retryImport(() => import('./lib/gundb/UserStorageClass')).then(_ => _.UserStorage)

        const mnemonic = await UserStorage.getMnemonic(userName, userPwd)

        if (mnemonic && bip39.validateMnemonic(mnemonic)) {
          const mnemonicsHelpers = retryImport(() => import('./lib/wallet/SoftwareWalletProvider'))
          const { saveMnemonics } = await mnemonicsHelpers
          await saveMnemonics(mnemonic)
          await AsyncStorage.setItem('GD_isLoggedIn', true)
          fireEvent(SIGNIN_SUCCESS)
          window.location = '/'
        }
      }
    } else {
      if (params.web3) {
        await AsyncStorage.setItem('GD_web3Token', params.web3)
        delete params.web3
      }
      let path = window.location.pathname.slice(1)
      path = path.length === 0 ? 'AppNavigation/Dashboard/Home' : path
      if ((params && Object.keys(params).length > 0) || path.indexOf('Marketplace') >= 0) {
        const dest = { path, params }
        log.debug('Saving destination url', dest)
        await AsyncStorage.setItem(DESTINATION_PATH, JSON.stringify(dest))
      }
    }
  } catch (e) {
    if (params.magiclink) {
      log.error('Magiclink signin failed', e.message, e)
      fireEvent(SIGNIN_FAILED)
    } else {
      log.error('parsing in-app link failed', e.message, e, params)
    }
  }
}

const showUpgradeDialog = (showDialog, serviceWorkerUpdated) => {
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
      textAlign: 'left',
      fontSize: normalize(14),
    },
  })

  showDialog({
    showCloseButtons: false,
    content: <ServiceWorkerUpdatedDialog />,
    buttonsContainerStyle: styles.serviceWorkerDialogButtonsContainer,
    buttons: [
      {
        text: 'WHAT’S NEW?',
        mode: 'text',
        color: theme.colors.gray80Percent,
        style: styles.serviceWorkerDialogWhatsNew,
        onPress: () => {
          window.open(Config.newVersionUrl, '_blank')
        },
      },
      {
        text: 'UPDATE',
        onPress: () => {
          if (serviceWorkerUpdated && serviceWorkerUpdated.waiting && serviceWorkerUpdated.waiting.postMessage) {
            log.debug('service worker:', 'sending skip waiting', serviceWorkerUpdated.active.clients)
            serviceWorkerUpdated.waiting.postMessage({ type: 'SKIP_WAITING' })
          }
        },
      },
    ],
  })
}

let AppRouter = React.lazy(() => {
  log.debug('initializing storage and wallet...')
  let walletAndStorageReady = retryImport(() => import(/* webpackChunkName: "init" */ './init'))
  let p2 = walletAndStorageReady.then(({ init, _ }) => init()).then(_ => log.debug('storage and wallet ready'))

  return Promise.all([retryImport(() => import(/* webpackChunkName: "router" */ './Router')), p2])
    .then(r => {
      log.debug('router ready')
      return r
    })
    .then(r => r[0])
})

const RouterSelector = () => {
  const [showDialog] = useDialog()
  const store = SimpleStore.useStore()
  const [displayUpgradeDialog, setDisplayUpgradeDialog] = useState(false)

  //we use global state for signup process to signal user has registered
  const isLoggedIn = store.get('isLoggedIn') //Promise.resolve( || AsyncStorage.getItem(IS_LOGGED_IN))
  const serviceWorkerUpdated = store.get('serviceWorkerUpdated')

  useEffect(() => {
    log.info('service worker updated', {
      serviceWorkerUpdated,
      displayUpgradeDialog,
    })

    if (!serviceWorkerUpdated && displayUpgradeDialog) {
      showUpgradeDialog(showDialog, serviceWorkerUpdated)
    }
  }, [serviceWorkerUpdated, displayUpgradeDialog])

  // upgrade dialog should be shown after the router is loaded - so wait for splash will be unmounted
  const allowDisplayingUpgradeDialog = useCallback(() => setDisplayUpgradeDialog(true), [setDisplayUpgradeDialog])

  const Router = useMemo(() => {
    log.debug('RouterSelector Rendered', { isLoggedIn })
    return isLoggedIn ? AppRouter : SignupRouter
  }, [isLoggedIn])

  return (
    <React.Suspense fallback={<Splash animation onUnmount={allowDisplayingUpgradeDialog} />}>
      <Router />
    </React.Suspense>
  )
}

export default RouterSelector
