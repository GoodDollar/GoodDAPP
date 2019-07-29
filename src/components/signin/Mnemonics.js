// @flow
import bip39 from 'bip39-light'
import get from 'lodash/get'
import React, { useState } from 'react'
import { AsyncStorage } from 'react-native'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import Text from '../common/view/Text'
import Section from '../common/layout/Section'

import CustomButton from '../common/buttons/CustomButton'
import MnemonicInput from './MnemonicInput'

//const TITLE = 'Recover my wallet'
const TITLE = 'Recover'
const log = logger.child({ from: TITLE })

const Mnemonics = ({ navigation, styles }) => {
  //lazy load heavy wallet stuff for fast initial app load (part of initial routes)
  const mnemonicsHelpers = import('../../lib/wallet/SoftwareWalletProvider')
  const [mnemonics, setMnemonics] = useState()
  const [showErrorDialog] = useErrorDialog()

  const handleChange = (mnemonics: []) => {
    log.info({ mnemonics })
    setMnemonics(mnemonics.join(' '))
  }

  const recover = async () => {
    if (!mnemonics || !bip39.validateMnemonic(mnemonics)) {
      showErrorDialog('Invalid Mnemonic')
      return
    }

    const { getMnemonics, saveMnemonics } = await mnemonicsHelpers
    const prevMnemonics = await getMnemonics()

    try {
      // We need to try to get a new address using new mnenonics
      await saveMnemonics(mnemonics)

      // We validate that a user was registered for the specified mnemonics
      const profile = await profileExist()

      if (profile) {
        await AsyncStorage.setItem('GOODDAPP_isLoggedIn', true)

        // There is no error and Profile exists. Reload screen to start with users mnemonics
        window.location = '/'
      } else {
        await saveMnemonics(prevMnemonics)
        showErrorDialog("Mnemonic doesn't match any existing account.")
      }
    } catch (err) {
      log.error(err)
      showErrorDialog('Error recovering account', err)
      saveMnemonics(prevMnemonics)
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
    return userStorage.userAlreadyExist()
  }

  const incomingMnemonic = get(navigation, 'state.params.mnemonic', undefined)

  return (
    <Section grow={5} style={styles.wrapper}>
      <Section.Stack grow style={styles.instructions} justifyContent="space-around">
        <Text fontWeight="bold" fontSize={22}>{`Please enter your\n12-word pass phrase:`}</Text>
        <Text color="gray50Percent">You can copy-paste it from your backup email</Text>
      </Section.Stack>
      <Section.Stack grow={4} justifyContent="space-between" style={styles.inputsContainer}>
        <MnemonicInput recoveryMode={false} onChange={handleChange} seed={incomingMnemonic} />
      </Section.Stack>
      <Section.Stack grow style={styles.bottomContainer} justifyContent="flex-end">
        <CustomButton mode="contained" onPress={recover} disabled={!mnemonics}>
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
    marginBottom: theme.paddings.defaultMargin,
    maxHeight: 50,
    minHeight: 50,
  },
})

export default withStyles(mnemonicsStyles)(Mnemonics)
