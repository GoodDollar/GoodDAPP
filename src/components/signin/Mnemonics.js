// @flow
//eslint-disable-next-line
import bip39 from 'bip39-light'
import get from 'lodash/get'
import React, { useEffect, useState } from 'react'
import { AsyncStorage } from 'react-native'
import { IS_LOGGED_IN } from '../../lib/constants/localStorage'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'
import { useDialog, useErrorDialog } from '../../lib/undux/utils/dialog'
import { getFirstWord } from '../../lib/utils/getFirstWord'
import Text from '../common/view/Text'
import Section from '../common/layout/Section'
import { showSupportDialog } from '../common/dialogs/showSupportDialog'
import CustomButton from '../common/buttons/CustomButton'
import InputText from '../common/form/InputText'

const TITLE = 'Recover'
const log = logger.child({ from: TITLE })
const MAX_WORDS = 12

const Mnemonics = ({ screenProps, navigation, styles }) => {
  //lazy load heavy wallet stuff for fast initial app load (part of initial routes)
  const mnemonicsHelpers = import('../../lib/wallet/SoftwareWalletProvider')
  const [mnemonics, setMnemonics] = useState()
  const [isRecovering, setRecovering] = useState(false)
  const [showDialog] = useDialog()
  const [errorMessage, setErrorMessage] = useState()
  const [showErrorDialog, hideDialog] = useErrorDialog()

  const handleChange = (mnemonics: string) => {
    log.info({ mnemonics })
    const splitted = mnemonics.split(' ')
    if (splitted.length > MAX_WORDS) {
      setErrorMessage('Your pass phrase appears to be incorrect.')
    } else {
      setErrorMessage(null)
    }
    if (splitted.length === MAX_WORDS) {
      setRecovering(true)
    } else {
      setRecovering(false)
    }
    setMnemonics(mnemonics)
  }

  const recover = async () => {
    setRecovering(true)

    const showError = () =>
      showErrorDialog('Your pass phrase appears\nto be incorrect.', undefined, {
        boldMessage: 'Please check it and try again.',
      })

    if (!mnemonics || !bip39.validateMnemonic(mnemonics)) {
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
      const [profile, fullName] = await profileExist()

      if (profile) {
        await AsyncStorage.setItem(IS_LOGGED_IN, true)
        const incomingRedirectUrl = get(navigation, 'state.params.redirect', '/')
        const firstName = getFirstWord(fullName)
        showDialog({
          visible: true,
          title: 'Welcome back!',
          buttons: [{ text: 'Yay!' }],
          message: `Hi ${firstName},\nyour wallet was recovered successfully`,
          onDismiss: () => (window.location = incomingRedirectUrl),
        })

        // There is no error and Profile exists. Reload screen to start with users mnemonics
        // window.location = incomingRedirectUrl
      } else {
        await saveMnemonics(prevMnemonics)
        showError()
      }
    } catch (e) {
      log.error(e.message, e)
      saveMnemonics(prevMnemonics)
      showSupportDialog(showErrorDialog, hideDialog, screenProps, 'men-1')
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

  /**
   * Helper to validate if exist a Gun profile associated to current mnemonic
   * @returns {Promise<Promise<*>|Promise<*>|Promise<any>>}
   */
  async function profileExist(): Promise<any> {
    const [Wallet, UserStorage] = await Promise.all([
      import('../../lib/wallet/GoodWalletClass').then(_ => _.GoodWallet),
      import('../../lib/gundb/UserStorageClass').then(_ => _.UserStorage),
    ])
    const wallet = new Wallet({ mnemonic: mnemonics })
    await wallet.ready
    const userStorage = new UserStorage(wallet)
    await userStorage.ready
    const exists = await userStorage.userAlreadyExist()
    return [exists, exists && (await userStorage.getProfileFieldDisplayValue('fullName'))]
  }

  return (
    <Section grow={5} style={styles.wrapper}>
      <Section.Stack grow style={styles.instructions} justifyContent="space-around">
        <Text fontWeight="medium" fontSize={22}>
          {'Please enter your\n12-word pass phrase:'}
        </Text>
      </Section.Stack>
      <Section.Stack grow={4} justifyContent="space-between">
        <Section.Row justifyContent="center">
          <InputText
            value={mnemonics}
            onChangeText={handleChange}
            error={errorMessage}
            onKeyPress={handleEnter}
            onCleanUpField={handleChange}
            autoFocus
          />
        </Section.Row>
      </Section.Stack>
      <Section.Row grow style={styles.instructions} justifyContent="space-around">
        <Text color="gray80Percent" fontSize={14}>
          {'You can copy-paste all of it at once\n rom your '}
          <Text color="gray80Percent" fontSize={14} fontWeight="bold">
            {'backup email'}
          </Text>
        </Text>
      </Section.Row>
      <Section.Stack grow style={styles.bottomContainer} justifyContent="flex-end">
        <CustomButton style={styles.buttonLayout} onPress={recover} disabled={!isRecovering}>
          Recover my wallet
        </CustomButton>
      </Section.Stack>
    </Section>
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
    marginVertical: 20,
  },
  bottomContainer: {
    maxHeight: 50,
    minHeight: 50,
  },
})

export default withStyles(mnemonicsStyles)(Mnemonics)
