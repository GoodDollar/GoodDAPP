// @flow
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Paragraph } from 'react-native-paper'
import { normalize } from 'react-native-elements'
import { getMnemonics, getMnemonicsObject } from '../../lib/wallet/SoftwareWalletProvider'
import { useDialog } from '../../lib/undux/utils/dialog'
import MnemonicInput from '../signin/MnemonicInput'
import { CustomButton } from '../common'
import { useWrappedApi } from '../../lib/API/useWrappedApi'

const TITLE = 'Back up your wallet'

type BackupWalletProps = {
  screenProps: any
}

const BackupWallet = ({ screenProps }: BackupWalletProps) => {
  const [showDialogWithData] = useDialog()
  const [mnemonics, setMnemonics] = useState('')
  const API = useWrappedApi()

  const getMnemonicsValue = async () => {
    const currentMnemonics = await getMnemonicsObject()
    setMnemonics(currentMnemonics)
  }

  useEffect(() => {
    getMnemonicsValue()
  }, [])

  const sendRecoveryEmail = async () => {
    const currentMnemonics = await getMnemonics()
    await API.sendRecoveryInstructionByEmail(currentMnemonics)
    showDialogWithData({
      title: 'Backup Your Wallet',
      message: 'We sent an email with recovery instructions for your wallet'
    })
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.topContainer}>
        <View style={styles.textContainer}>
          <Paragraph style={[styles.fontBase, styles.paragraph]}>
            Please write down your 12-word passphrase and keep it in a secure location so you can restore your wallet
            anytime.
          </Paragraph>
        </View>
        <View style={styles.formContainer}>
          <MnemonicInput recoveryMode={mnemonics} />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <CustomButton mode="outlined" onPress={sendRecoveryEmail} color="#575757">
          RESEND BACKUP EMAIL
        </CustomButton>
      </View>
    </View>
  )
}

BackupWallet.navigationOptions = {
  title: TITLE
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
    padding: '1em',
    justifyContent: 'space-between'
  },
  topContainer: {
    flex: 2,
    display: 'flex',
    justifyContent: 'center',
    padding: 0,
    margin: 0
  },
  bottomContainer: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  fontBase: {
    color: '#555555',
    textAlign: 'center'
  },
  inputs: {
    width: '0.45vw',
    height: '2rem',
    margin: '0 1rem',
    fontSize: '1rem',
    borderRadius: 4
  },
  paragraph: {
    fontSize: normalize(18),
    lineHeight: '1.2em'
  },
  doneButton: {
    marginTop: '1em'
  }
})

export default BackupWallet
