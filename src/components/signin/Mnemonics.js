// @flow
//eslint-disable-next-line

import React, { useEffect, useRef, useState } from 'react'
import { get } from 'lodash'
import bip39 from 'bip39-light'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { IS_LOGGED_IN } from '../../lib/constants/localStorage'
import logger from '../../lib/logger/pino-logger'
import { ExceptionCategory } from '../../lib/logger/exceptions'
import { withStyles } from '../../lib/styles'
import { useDialog, useErrorDialog } from '../../lib/undux/utils/dialog'
import { getFirstWord } from '../../lib/utils/getFirstWord'
import { userExists } from '../../lib/login/userExists'
import Text from '../common/view/Text'
import Section from '../common/layout/Section'
import { showSupportDialog } from '../common/dialogs/showSupportDialog'
import SuccessAnimation from '../common/animations/Success'
import CustomButton from '../common/buttons/CustomButton'
import InputText from '../common/form/InputText'
import { CLICK_BTN_RECOVER_WALLET, fireEvent, RECOVER_FAILED, RECOVER_SUCCESS } from '../../lib/analytics/analytics'
import Wrapper from '../common/layout/Wrapper'

const TITLE = 'Recover'
const log = logger.child({ from: TITLE })
const MAX_WORDS = 12

const Mnemonics = ({ screenProps, navigation, styles }) => {
  //lazy load heavy wallet stuff for fast initial app load (part of initial routes)
  const mnemonicsHelpers = import('../../lib/wallet/SoftwareWalletProvider')
  const [mnemonics, setMnemonics] = useState()
  const [isRecovering, setRecovering] = useState(false)
  const [isSubmitBlocked, setSubmitBlocked] = useState(true)
  const [showDialog] = useDialog()
  const [errorMessage, setErrorMessage] = useState()
  const [showErrorDialog, hideDialog] = useErrorDialog()
  const input = useRef()

  AsyncStorage.removeItem('GD_web3Token')

  const handleChange = (mnemonics: string) => {
    log.info({ mnemonics })
    const splitted = mnemonics.split(' ').filter(o => o)
    if (splitted.length > MAX_WORDS) {
      setErrorMessage('Your pass phrase appears to be incorrect.')
    } else {
      setErrorMessage(null)
    }
    if (splitted.length === MAX_WORDS) {
      setSubmitBlocked(false)
    } else {
      setSubmitBlocked(true)
    }
    setMnemonics(mnemonics)
  }

  const recover = async () => {
    //required to wallet and storage are reinitialized
    const curVersion = await AsyncStorage.getItem('GD_version')
    await AsyncStorage.clear()
    AsyncStorage.setItem('GD_version', curVersion)
    input.current.blur()
    setRecovering(true)
    fireEvent(CLICK_BTN_RECOVER_WALLET)

    const showError = () => {
      const error = new Error('Incorrect pass phrase received')

      log.error('Wallet recover failed', error.message, error, {
        mnemonics,
        category: ExceptionCategory.Human,
        dialogShown: true,
      })
      showErrorDialog('Your pass phrase appears\nto be incorrect.', undefined, {
        boldMessage: 'Please check it and try again.',
      })
    }

    if (!mnemonics || !bip39.validateMnemonic(mnemonics)) {
      fireEvent(RECOVER_FAILED, { invalidMnemonics: true })
      setRecovering(false)
      showError()
      return
    }

    const { getMnemonics, saveMnemonics } = await mnemonicsHelpers
    const prevMnemonics = await getMnemonics()

    try {
      // We need to try to get a new address using new mnenonics
      //eslint-disable-next-line
      await saveMnemonics(mnemonics)

      // We validate that a user was registered for the specified mnemonics
      const { exists, fullName } = await userExists(mnemonics)
      log.debug('userExists result:', { exists, fullName })

      if (exists) {
        await AsyncStorage.setItem(IS_LOGGED_IN, true)
        const incomingRedirectUrl = get(navigation, 'state.params.redirect', '/')
        const firstName = getFirstWord(fullName)
        showDialog({
          visible: true,
          image: <SuccessAnimation />,
          buttons: [{ text: 'Yay!' }],
          message: `Hi ${firstName},\nyour wallet was recovered successfully`,
          onDismiss: () => (window.location = incomingRedirectUrl),
        })
        fireEvent(RECOVER_SUCCESS)

        // There is no error and Profile exists. Reload screen to start with users mnemonics
        // window.location = incomingRedirectUrl
      } else {
        fireEvent(RECOVER_FAILED, { noProfileFound: true })
        await saveMnemonics(prevMnemonics)
        showError()
      }
    } catch (e) {
      fireEvent(RECOVER_FAILED, { unexpected: true })
      log.error('recover mnemonics failed', e.message, e, { dialogShown: true })
      saveMnemonics(prevMnemonics)
      showSupportDialog(showErrorDialog, hideDialog, screenProps.push)
    } finally {
      setRecovering(false)
    }
  }
  const handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter') {
      recover()
    }
  }

  const incomingMnemonic = get(navigation, 'state.params.mnemonic', undefined)

  useEffect(() => {
    if (incomingMnemonic) {
      handleChange(incomingMnemonic)
    }
  }, [])

  const web3HasWallet = get(navigation, 'state.params.web3HasWallet')

  return (
    <Wrapper style={styles.mainWrapper}>
      <Section grow={5} style={styles.wrapper}>
        <Section.Stack grow style={styles.instructions} justifyContent="space-around">
          <Text fontWeight="medium" fontSize={22}>
            {'Please enter your\n12-word pass phrase:'}
          </Text>
          {web3HasWallet && (
            <Text color="gray80Percent" fontSize={14}>
              Looks like you already have a wallet. Please recover it to continue
            </Text>
          )}
        </Section.Stack>
        <Section.Stack grow={4} justifyContent="space-between">
          <Section.Row justifyContent="center">
            <InputText
              value={mnemonics}
              onChangeText={handleChange}
              error={errorMessage}
              onKeyPress={handleEnter}
              getRef={input}
              showCleanAdornment
              autoFocus
            />
          </Section.Row>
        </Section.Stack>
        <Section.Row style={styles.instructions} justifyContent="space-around">
          <Text color="gray80Percent" fontSize={14}>
            {'You can copy-paste all of it at once\n from your '}
            <Text color="gray80Percent" fontSize={14} fontWeight="bold">
              {'backup email'}
            </Text>
          </Text>
        </Section.Row>
        <Section.Stack grow style={styles.bottomContainer} justifyContent="flex-end">
          <CustomButton style={styles.buttonLayout} onPress={recover} disabled={isSubmitBlocked || isRecovering}>
            Recover my wallet
          </CustomButton>
        </Section.Stack>
      </Section>
    </Wrapper>
  )
}

Mnemonics.navigationOptions = {
  title: TITLE,
}

const mnemonicsStyles = ({ theme }) => ({
  wrapper: {
    borderRadius: 0,
  },
  instructions: {
    marginVertical: theme.paddings.defaultMargin,
  },
  buttonLayout: {
    marginTop: 20,
    marginBottom: 20,
  },
  bottomContainer: {
    maxHeight: 80,
    minHeight: 80,
  },
  mainWrapper: {
    backgroundImage: 'none',
    backgroundColor: 'none',
  },
})

export default withStyles(mnemonicsStyles)(Mnemonics)
