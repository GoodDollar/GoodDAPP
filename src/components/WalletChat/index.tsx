import React from 'react'

import { WalletChatWidget } from 'react-wallet-chat-gd'
import { isMobile } from 'react-device-detect'
import { useWeb3Context } from '@gooddollar/web3sdk-v2'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'

const WalletChat = () => {
    const { account, chainId, label } = useActiveWeb3React()
    const { web3Provider } = useWeb3Context()

    return (
        <WalletChatWidget
            style={{ marginBottom: isMobile ? '75px' : '0px' }}
            connectedWallet={
                account && chainId
                    ? {
                          walletName: label || '',
                          account: account,
                          chainId,
                          provider: web3Provider,
                      }
                    : undefined
            }
        />
    )
}

export default WalletChat
