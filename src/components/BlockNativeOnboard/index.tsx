import React, { FC, useEffect, useRef } from 'react'
import { useConnectWallet } from '@web3-onboard/react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import useSendAnalyticsData from '../../hooks/useSendAnalyticsData'
import { noop } from 'lodash'
import { Web3ActionButton } from '@gooddollar/good-design'
import { SupportedChains, AsyncStorage, getDevice } from '@gooddollar/web3sdk-v2'
import { connectOptions, torus } from 'connectors'

import { OnboardProvider } from '@gooddollar/web3sdk-v2'
import { useSelectedChain } from 'state/application/hooks'

/**
 * Just a button to trigger the onboard connect modal.
 * any state updates after succesfully connecting are handled by useOnboardConnect (src/hooks/useActiveOnboard)
 * @returns Connect Button or Empty
 */

export const clearDeeplink = () => {
    const osName = getDevice().os.name
    // temp solution for where it tries and open a deeplink for desktop app
    if (['Linux', 'Windows', 'macOS', 'iOS'].includes(osName)) {
        AsyncStorage.safeRemove('WALLETCONNECT_DEEPLINK_CHOICE')
    }
}

export const OnboardConnectButton: FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
    const sendData = useSendAnalyticsData()
    const { i18n } = useLingui()
    const buttonText = i18n._(t`Connect to a wallet`)
    // flag to detect for wallet connected only after we pressed a button
    const connectionStartedRef = useRef(false)

    const onWalletConnect = async () => {
        connectionStartedRef.current = true
        sendData({ event: 'wallet_connect', action: 'wallet_connect_start' })

        try {
            clearDeeplink()
            await connect()
        } catch {
            connectionStartedRef.current = false
        }

        return false
    }

    useEffect(() => {
        if (!connectionStartedRef.current) {
            return
        }

        if (!connecting && wallet) {
            connectionStartedRef.current = false
        }
    }, [connecting, wallet])

    if (wallet) {
        return null
    }

    return (
        <Web3ActionButton
            text={buttonText}
            web3Action={noop}
            supportedChains={[SupportedChains.CELO, SupportedChains.MAINNET, SupportedChains.FUSE]}
            handleConnect={onWalletConnect}
            variant={'outlined'}
            isDisabled={connecting}
            isLoading={connecting}
        />
    )
}

// wrapper so we can pass the selected chain
export const OnboardProviderWrapper = ({ children }) => {
    const { selectedChain } = useSelectedChain()
    return (
        <OnboardProvider
            options={connectOptions}
            wallets={{ custom: [torus] }}
            wc2Options={{ requiredChains: [selectedChain] }}
        >
            {children}
        </OnboardProvider>
    )
}
