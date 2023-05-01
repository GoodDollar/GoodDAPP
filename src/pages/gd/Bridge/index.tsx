import React, { memo, useCallback, useMemo, useState } from 'react'
import { useSwitchNetwork } from '@gooddollar/web3sdk-v2'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useApplicationTheme } from 'state/application/hooks'
import {
    KimaTransactionWidget,
    KimaProvider,
    FontSizeOptions,
    ColorModeOptions,
    ModeOptions,
    DAppOptions,
} from '@kimafinance/kima-transaction-widget'
import '@kimafinance/kima-transaction-widget/dist/index.css'
import useSendAnalyticsData from 'hooks/useSendAnalyticsData'
import { KimaModal } from '@gooddollar/good-design'

//Temporary solution a source network can be gotten from provider
// but there is no way (yet) to get the selected target network active in the widget
const SupportedBridgeNetworks = {
    FUSE: 122,
    CELO: 42220,
}

const Bridge = memo(() => {
    const { library, chainId } = useActiveWeb3React()
    const [theme] = useApplicationTheme()
    const sendData = useSendAnalyticsData()
    const { switchNetwork } = useSwitchNetwork()
    const [bridgeStatus, setBridgeStatus] = useState<boolean | undefined>(undefined)

    const activeChain = useMemo(() => {
        const supportedNetworks = Object.keys(SupportedBridgeNetworks)

        if (chainId === (SupportedBridgeNetworks.CELO as number)) {
            supportedNetworks.reverse()
        }

        const [origin, destination] = supportedNetworks

        return { origin, destination }
    }, [chainId])

    const successHandler = useCallback(() => {
        setBridgeStatus(true)
        sendData({ event: 'kima_bridge', action: 'bridge_success' })
    }, [sendData, setBridgeStatus])

    const errorHandler = useCallback(
        (e) => {
            if (e?.code === 'NETWORK_ERROR' || e?.code === 4001) return
            console.log('Kima bridge error:', { message: e?.message, e })
            setBridgeStatus(false)
            sendData({ event: 'kima_bridge', action: 'bridge_failure', error: e?.message })
        },
        [sendData, setBridgeStatus]
    )

    const resetState = () => {
        setBridgeStatus(undefined)
    }

    const switchChainHandler = useCallback(
        async (chainId) => {
            await switchNetwork(chainId)
        },
        [switchNetwork]
    )

    const options = useMemo(
        () => ({
            theme: {
                colorMode: theme === 'dark' ? ColorModeOptions.dark : ColorModeOptions.light,
                fontSize: FontSizeOptions.medium,
                fontFamily: 'Roboto',
                backgroundColorDark: 'rgb(21, 26, 48)',
            },
            mode: ModeOptions.bridge,
            dAppOption: DAppOptions.G$,
            kimaBackendUrl: 'https://gooddollar-beta.kima.finance',
            kimaNodeProviderQuery: 'https://api_testnet.kima.finance',
            provider: library,
            compliantOption: false,
            autoConnect: false,
            helpURL: 'https://t.me/GoodDollarX',
        }),
        [theme, library]
    )

    return (
        <KimaModal success={bridgeStatus} networks={activeChain} resetState={resetState}>
            <KimaProvider>
                <KimaTransactionWidget
                    {...options}
                    successHandler={successHandler}
                    errorHandler={errorHandler}
                    switchChainHandler={switchChainHandler}
                />
            </KimaProvider>
        </KimaModal>
    )
})

export default Bridge
