// @flow
import bip39 from 'bip39-light'
import React, { useState } from 'react'
import { AsyncStorage } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { Section, Text } from '../common'
import CustomButton from '../common/buttons/CustomButton'
import MnemonicInput from './MnemonicInput'

//const TITLE = 'Recover my wallet'
const TITLE = 'Recover'
const log = logger.child({ from: TITLE })

const Mnemonics = ({ styles, theme }) => {
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

  return (
    <Section grow={5} style={styles.wrapper}>
      <Section.Stack grow style={styles.instructions} justifyContent="space-around">
        <Text fontWeight="bold" fontSize={22}>{`Please enter your\n12-word pass phrase:`}</Text>
        <Text color={theme.colors.gray50Percent} fontSize={14}>
          You can copy-paste it from your backup email
        </Text>
      </Section.Stack>
      <Section.Stack grow={4} justifyContent="space-between" style={styles.inputsContainer}>
        <MnemonicInput recoveryMode={false} onChange={handleChange} />
      </Section.Stack>
      <Section.Stack grow style={styles.bottomContainer} justifyContent="flex-end">
        <CustomButton mode="contained" onPress={recover} disabled={!mnemonics}>
          RECOVER MY WALLET
        </CustomButton>
      </Section.Stack>
    </Section>
  )
}

/**
 * Helper to validate if exist a Gun profile associated to current mnemonic
 * @returns {Promise<Promise<*>|Promise<*>|Promise<any>>}
 */
async function profileExist(): Promise<any> {
  const [wallet, userStorage] = await Promise.all([
    import('../../lib/wallet/GoodWallet').then(_ => _.default),
    import('../../lib/gundb/UserStorage').then(_ => _.default)
  ])

  await wallet.init()

  // reinstantiates wallet and userStorage with new mnemonics
  await userStorage.init()

  return userStorage.userAlreadyExist()
}

Mnemonics.navigationOptions = {
  title: TITLE
}

const mnemonicsStyles = ({ theme }) => ({
  wrapper: {
    borderRadius: 0
  },
  instructions: {
    marginVertical: normalize(theme.paddings.mainContainerPadding)
  },
  inputsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: normalize(theme.paddings.mainContainerPadding),
    marginHorizontal: normalize(theme.paddings.mainContainerPadding)
  },
  bottomContainer: {
    marginVertical: normalize(theme.paddings.mainContainerPadding)
  }
})

export default withStyles(mnemonicsStyles)(Mnemonics)
