// @flow
import React, { useCallback, useMemo } from 'react'
import { t } from '@lingui/macro'
import { Wallet } from '@ethersproject/wallet'
import snapshot from '@snapshot-labs/snapshot.js'
import { useDialog } from '../../lib/dialog/useDialog'
import { useUserStorage, useWallet } from '../../lib/wallet/GoodWalletProvider'
import { Section } from '../common'
import logger from '../../lib/logger/js-logger'
import { fireEvent, GOVERNANCE_JOINSNAPSHOT } from '../../lib/analytics/analytics'
import { openLink } from '../../lib/utils/linking'

const log = logger.child({ from: 'JoinSnapshot' })

export const useJoinSnapshot = () => {
  const hub = 'https://hub.snapshot.org' // or https://testnet.snapshot.org for testnet
  const client = new snapshot.Client712(hub)
  const wallet = useWallet()
  const storage = useUserStorage()
  const { showDialog } = useDialog()

  const web3Provider = useMemo(() => {
    if (!wallet) {
      return
    }

    //TODO: adapt to support 3rd party wallets
    return new Wallet(wallet.accounts[0].privateKey)
  }, [wallet])

  const hasJoined = useCallback(() => {
    return !!storage.userProperties.get('joinedSnapshot')
  }, [])

  const handleJoin = useCallback(
    async (dismiss): Promise<boolean> => {
      try {
        await client.follow(web3Provider, wallet.account, { space: 'thegooddao.eth', from: wallet.account })
        storage.userProperties.set('joinedSnapshot', true)
        fireEvent(GOVERNANCE_JOINSNAPSHOT)
        showDialog({
          message: (
            <Section style={{ flex: 1, justifyContent: 'center' }}>
              <Section.Text
                fontWeight="bold"
                fontSize={18}
                lineHeight={26}
                textDecorationLine="underline"
                style={{ cursor: 'pointer' }}
                onPress={() => openLink('https://snapshot.org/#/thegooddao.eth')}
              >
                {t`Visit the GoodDAO on Snapshot`}
              </Section.Text>
            </Section>
          ),
        })
        return true
      } catch (e) {
        log.error('failed joining snapshot', e.message, e)
        return false
      }
    },
    [web3Provider],
  )

  const showJoinSnapshotDialog = (loading = false) =>
    showDialog({
      title: t`Join the GoodDAO`,
      message: t`Read more`,
      image: <React.Fragment />,
      buttons: [
        {
          text: 'JOIN',
          onPress: () => {
            showJoinSnapshotDialog(true)
            handleJoin()
          },
        },
      ],
      isMinHeight: false,
      loading,
    })

  return { showJoinSnapshotDialog, handleJoin, hasJoined }
}
