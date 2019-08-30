// @flow
//eslint-disable-next-line
import bip39 from 'bip39-light'
import get from 'lodash/get'
import React, { useState } from 'react'
import { AsyncStorage } from 'react-native'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'
import { useDialog, useErrorDialog } from '../../lib/undux/utils/dialog'
import { getFirstWord } from '../../lib/utils/getFirstWord'
import Text from '../common/view/Text'
import Section from '../common/layout/Section'
import { showSupportDialog } from '../common/dialogs/showSupportDialog'
import CustomButton from '../common/buttons/CustomButton'
import MnemonicInput from './MnemonicInput'

//const TITLE = 'Recover my wallet'
const TITLE = 'Recover'
const log = logger.child({ from: TITLE })

const Mnemonics = ({ screenProps, navigation, styles }) => {
  //lazy load heavy wallet stuff for fast initial app load (part of initial routes)
  const mnemonicsHelpers = import('../../lib/wallet/SoftwareWalletProvider')
  const [mnemonics, setMnemonics] = useState()
  const [isRecovering, setRecovering] = useState(false)
  const [showDialog] = useDialog()
  const [showErrorDialog, hideDialog] = useErrorDialog()

  const handleChange = (mnemonics: []) => {
    log.info({ mnemonics })
    setMnemonics(mnemonics.join(' '))
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
        await AsyncStorage.setItem('GOODDAPP_isLoggedIn', true)
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
    const exists = userStorage.userAlreadyExist()
    return [exists, exists && (await userStorage.getProfileFieldDisplayValue('fullName'))]
  }

  const incomingMnemonic = get(navigation, 'state.params.mnemonic', undefined)

  return (
    <Section grow={5} style={styles.wrapper}>
      <Section.Stack grow style={styles.instructions} justifyContent="space-around">
        <Text fontWeight="medium" fontSize={22}>
          {'Please enter your\n12-word pass phrase:'}
        </Text>
        <Text color="gray80Percent" fontSize={14}>
          You can copy-paste it from your backup email
        </Text>
      </Section.Stack>
      <Section.Stack grow={4} justifyContent="space-between" style={styles.inputsContainer}>
        <MnemonicInput recoveryMode={false} onChange={handleChange} seed={incomingMnemonic} />
      </Section.Stack>
      <Section.Stack grow style={styles.bottomContainer} justifyContent="flex-end">
        <CustomButton mode="contained" onPress={recover} disabled={isRecovering || !mnemonics}>
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
  inputsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: theme.paddings.defaultMargin,
    marginVertical: theme.paddings.defaultMargin,
    overflowY: 'auto',
  },
  bottomContainer: {
    backgroundColor: theme.colors.surface,
    maxHeight: 50,
    minHeight: 50,
  },
})

export default withStyles(mnemonicsStyles)(Mnemonics)
