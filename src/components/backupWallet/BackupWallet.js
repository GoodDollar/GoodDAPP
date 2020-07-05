// @flow
import React, { useEffect, useState } from 'react'
import useClipboard from '../../lib/hooks/useClipboard'
import { useWrappedApi } from '../../lib/API/useWrappedApi'
import { withStyles } from '../../lib/styles'
import { useDialog, useErrorDialog } from '../../lib/undux/utils/dialog'
import { getMnemonics, getMnemonicsObject } from '../../lib/wallet/SoftwareWalletProvider'
import normalize from '../../lib/utils/normalizeText'
import { CustomButton, Section, Text } from '../common'
import MnemonicInput from '../signin/MnemonicInput'
import userStorage from '../../lib/gundb/UserStorage'
import { backupMessage } from '../../lib/gundb/UserStorageClass'
import logger from '../../lib/logger/pino-logger'
import { fireEvent, PHRASE_BACKUP } from '../../lib/analytics/analytics'
import Wrapper from '../common/layout/Wrapper'

const log = logger.child({ from: 'BackupWallet' })
const TITLE = 'Backup my wallet'

type BackupWalletProps = {
  styles: {},
  theme: {},
  screenProps: any,
}

const BackupWallet = ({ screenProps, styles, theme }: BackupWalletProps) => {
  const [showDialogWithData] = useDialog()
  const [showErrorDialog] = useErrorDialog()
  const [mnemonics, setMnemonics] = useState('')
  const API = useWrappedApi()
  const [, setString] = useClipboard()

  const getMnemonicsValue = async () => {
    const currentMnemonics = await getMnemonicsObject()
    setMnemonics(currentMnemonics)
  }

  useEffect(() => {
    getMnemonicsValue()
  }, [])

  const sendRecoveryEmail = async () => {
    try {
      const currentMnemonics = await getMnemonics()
      await API.sendRecoveryInstructionByEmail(currentMnemonics)
      fireEvent(PHRASE_BACKUP, { method: 'email' })
      showDialogWithData({
        title: 'Backup Your Wallet',
        message: 'We sent an email with recovery instructions for your wallet',
      })
    } catch (e) {
      log.error('backup email failed:', e.message, e)
      showErrorDialog('Could not send backup email. Please try again.')
    }
    const userProperties = await userStorage.userProperties.getAll()
    if (userProperties.isMadeBackup) {
      userStorage.deleteEvent(backupMessage.id).catch(e => log.error('delete backup message failed', e.message, e))
    } else {
      await userStorage.userProperties.set('isMadeBackup', true)
    }
  }

  const setClipboard = async () => {
    const currentMnemonics = await getMnemonics()

    if (await setString(currentMnemonics)) {
      fireEvent(PHRASE_BACKUP, { method: 'copy' })
      showDialogWithData({
        title: 'Copy all to clipboard',
        message: 'The backup phrase has been copied to the clipboard',
      })
    }
  }

  return (
    <Wrapper style={styles.mainWrapper}>
      <Section grow={5} style={styles.wrapper}>
        <Text grow fontWeight="bold" fontSize={16} style={styles.instructions}>
          {'please save your 12-word pass phrase\n'}
          <Text grow fontSize={16} style={styles.instructions}>
            {'and keep it in a secure location\n' + 'so you can recover your wallet anytime'}
          </Text>
        </Text>
        <Section.Stack grow justifyContent="space-between" style={styles.inputsContainer}>
          <MnemonicInput recoveryMode={mnemonics} />
        </Section.Stack>
        <Section.Stack style={styles.bottomContainer} justifyContent="space-between" alignItems="stretch">
          <CustomButton textStyle={styles.resendButton} mode="text" compact={true} onPress={setClipboard}>
            Copy all to clipboard
          </CustomButton>
          <CustomButton textStyle={styles.resendButton} mode="text" compact={true} onPress={sendRecoveryEmail}>
            Send me a backup email
          </CustomButton>
        </Section.Stack>
        <CustomButton onPress={screenProps.pop}>Done</CustomButton>
      </Section>
    </Wrapper>
  )
}

const backupWalletStyles = ({ theme }) => ({
  wrapper: {
    borderRadius: 0,
  },
  instructions: {
    marginVertical: theme.paddings.defaultMargin,
  },
  inputsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: theme.paddings.defaultMargin,
    overflowY: 'auto',
  },
  bottomContainer: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.paddings.defaultMargin,
  },
  resendButton: {
    color: theme.colors.primary,
    fontWeight: 'normal',
    fontSize: normalize(15),
    textDecorationLine: 'underline',
  },
  mainWrapper: {
    backgroundImage: 'none',
    backgroundColor: 'none',
  },
})

const backupWallet = withStyles(backupWalletStyles)(BackupWallet)

backupWallet.navigationOptions = {
  title: TITLE,
}

export default backupWallet
