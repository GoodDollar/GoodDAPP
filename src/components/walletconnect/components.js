import React, { useState } from 'react'
import { Picker, Platform, View } from 'react-native'
import { t } from '@lingui/macro'

import { truncateMiddle } from '../../lib/utils/string'
import { CustomButton, Image, Section, Text } from '../common'
import InputWithAdornment from '../common/form/InputWithAdornment'
import QrReader from '../dashboard/QR/QRScanner'
import wcExample from '../../assets/walletconnectExample.png'
import { useChainsList } from '../../lib/wallet/WalletConnectClient'
import { useDialog } from '../../lib/dialog/useDialog'
import { Launch, WcHeader } from './WalletConnectModals'

export const Divider = ({ size = 50 }) => <Section.Separator color="transparent" width={size} style={{ zIndex: -10 }} />

export const SwitchChain = ({ switchChain, chainId }) => {
  const [chain, setChain] = useState(chainId)
  const chains = useChainsList()

  return (
    <Section style={{ flexDirection: 'row', paddingHorizontal: 0 }}>
      <Section.Text textAlign={'left'} style={{ flex: 1 }}>
        {t`Change Network:`}
      </Section.Text>
      <Picker
        style={{ flex: 2, width: '100%' }}
        selectedValue={chain}
        onValueChange={(itemValue, itemIndex) => {
          if (itemValue !== chain) {
            switchChain && switchChain(chains[itemIndex])
            setChain(itemValue)
          }
        }}
      >
        {chains.map(chain => (
          <Picker.Item label={chain.name} value={chain.chainId} key={chain.chainId} />
        ))}
      </Picker>
    </Section>
  )
}

const PendingTxs = ({ explorer, cancelTx, txs }) => {
  const [canceling, setCanceling] = useState([])
  const { showErrorDialog } = useDialog()
  const onCancel = async txHash => {
    setCanceling([...canceling, txHash])
    try {
      await cancelTx()
    } catch (e) {
      showErrorDialog(t`Canceling transaction failed.`, e.message)
    } finally {
      setCanceling(canceling.filter(_ => _ !== txHash))
    }
  }
  if (!txs?.length) {
    return null
  }
  return (
    <Section>
      <Section.Title fontSize={16}>{t`Pending Transactions`}</Section.Title>
      {txs.map(({ txHash }) => (
        <Section
          key={txHash}
          style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text style={{ color: 'lightBlue', flex: 1 }} fontSize={12}>
            {truncateMiddle(txHash, 20)}
            <Launch explorer={explorer} txHash={txHash} />
          </Text>
          <View>
            <CustomButton
              onPress={() => onCancel(txHash)}
              loading={canceling.includes(txHash)}
            >{t`Cancel`}</CustomButton>
          </View>
        </Section>
      ))}
    </Section>
  )
}
export const ConnectedState = ({ session, disconnect, switchChain, chainPendingTxs, cancelTx, explorer }) => {
  return (
    <Section>
      <WcHeader session={session} />
      <SwitchChain switchChain={switchChain} chainId={session.chainId} />
      <CustomButton onPress={disconnect} color={'red'}>
        {t`Disconnect`}
      </CustomButton>
      <PendingTxs txs={chainPendingTxs} cancelTx={cancelTx} explorer={explorer} />
    </Section>
  )
}

export const PasteCode = ({ handlePastePress, handleChange, setUri, uri, styles }) => (
  <View>
    <Section.Title fontWeight="medium">{t`Paste Code`}</Section.Title>
    <View style={{ flexDirection: 'row' }}>
      <View style={{ flex: 1, gap: 12, marginRight: 12 }}>
        <Image
          source={wcExample}
          resizeMode={'contain'}
          style={{ width: '100%', height: Platform.select({ web: 'auto', default: undefined }), aspectRatio: 1 }}
        />
      </View>
      <View style={{ flex: 2, justifyContent: 'flex-end' }}>
        <View>
          <InputWithAdornment
            showAdornment={true}
            adornment="paste"
            adornmentSize={32}
            adornmentAction={handlePastePress}
            onChangeText={setUri}
            value={uri}
            placeholder="wc:1234123jakljasdkjasfd..."
          />
        </View>
        <CustomButton onPress={() => handleChange(uri)} style={[styles.connectButton]}>{t`Connect`}</CustomButton>
      </View>
    </View>
  </View>
)

export const ScanCode = ({ hasCameraAccess, styles, handleChange, handleError, qrDelay }) => {
  if (!hasCameraAccess) {
    return null
  }
  return (
    <View>
      <Section.Title fontWeight="medium">{t`Scan Code`}</Section.Title>
      <QrReader
        delay={qrDelay}
        onError={handleError}
        onScan={e => {
          if (e) {
            handleChange(e)
          }
        }}
        style={{ width: '100%' }}
      />
      <Divider size={30} />
    </View>
  )
}
