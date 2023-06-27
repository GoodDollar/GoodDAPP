import React, { useCallback } from 'react'

import { darkTheme, lightTheme, OnTxFail, OnTxSubmit, OnTxSuccess, SwapWidget } from '@uniswap/widgets'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useConnectWallet } from '@web3-onboard/react'
import {
    AsyncStorage,
    getDevice,
    G$ContractAddresses,
    useGetEnvChainId,
    useWeb3Context,
    SupportedChains,
} from '@gooddollar/web3sdk-v2'
import { useDispatch } from 'react-redux'
import { addTransaction } from 'state/transactions/actions'
import { ChainId } from '@sushiswap/sdk'
import { isMobile } from 'react-device-detect'
import { Box } from 'native-base'

import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useApplicationTheme } from 'state/application/hooks'
import useSendAnalytics from 'hooks/useSendAnalyticsData'
import { tokens } from './celo-tokenlist.json'

const jsonRpcUrlMap = {
    122: ['https://rpc.fuse.io', 'https://fuse-rpc.gateway.pokt.network'],
    42220: ['https://forno.celo.org', 'https://celo-rpc.gateway.pokt.network'],
}

export const UniSwap = (): JSX.Element => {
    const [theme] = useApplicationTheme()
    const uniTheme = theme === 'dark' ? darkTheme : lightTheme
    const { web3Provider } = useWeb3Context()
    const { account, chainId } = useActiveWeb3React()
    const network = SupportedChains[chainId]
    const [, connect] = useConnectWallet()
    const globalDispatch = useDispatch()
    const sendData = useSendAnalytics()
    const { connectedEnv } = useGetEnvChainId(42220)
    const gdTokenAddress = G$ContractAddresses('GoodDollar', connectedEnv) as string
    const containerWidth = isMobile ? 'auto' : '550px'

    const customTheme = {
        ...uniTheme,
        primary: '#404040',
        fontFamily: 'Roboto',
        accent: '#00AEFF',
        outline: '#00AFFF',
        active: '#00AFFF',
        accentSoft: '#00AEFF',
        networkDefaultShadow: 'hsl(199deg 100% 50% / 20%)',
    }

    const tokenSymbols = {
        [gdTokenAddress]: 'G$',
    }

    const gdToken = {
        chainId: 42220,
        address: gdTokenAddress,
        name: connectedEnv.includes('production') ? 'GoodDollar' : 'GoodDollar Dev',
        symbol: 'G$',
        decimals: 18,
        logoURI:
            'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gd-logo.png',
    }

    tokens.push(gdToken)

    const connectOnboard = useCallback(async () => {
        if (!account) {
            // todo: make connect onboard a generic function/merge with: useOnboardConnect
            const osName = getDevice().os.name
            // temp solution for where it tries and open a deeplink for desktop app
            if (['Linux', 'Windows', 'macOS'].includes(osName)) {
                AsyncStorage.safeRemove('WALLETCONNECT_DEEPLINK_CHOICE')
            }

            const connected = await connect()
            if (!connected) {
                return false
            }
        }
        return true
    }, [connect])

    const handleError = useCallback(async (e) => {
        sendData({ event: 'swap', action: 'swap_failed', error: e.message })
    }, [])

    const handleTxFailed: OnTxFail = useCallback(async (error: string, data: any) => {
        console.log('handleTxFailed -->', { error, data })
    }, [])

    const handleTxSubmit: OnTxSubmit = useCallback(
        async (txHash: string, data: any) => {
            const { info } = data
            switch (info.type) {
                //approve
                case 0: {
                    const { tokenAddress } = info
                    const symbol = tokenSymbols[tokenAddress]
                    const summary = symbol ? `Approved spending of ${symbol}` : 'Approved spending'
                    const type = symbol ? 'sell' : 'buy'
                    sendData({ event: 'swap', action: 'swap_approve', type, network })
                    globalDispatch(
                        addTransaction({
                            chainId: 42220 as ChainId,
                            hash: txHash,
                            from: account!,
                            summary,
                        })
                    )
                    break
                }
                // swap
                case 1: {
                    const { trade } = info
                    const { input, output } = trade.routes[0]
                    const {
                        inputAmount,
                        outputAmount,
                    }: { inputAmount: CurrencyAmount<Currency>; outputAmount: CurrencyAmount<Currency> } =
                        trade.swaps[0]
                    const tradeInfo = {
                        input: {
                            decimals: input.decimals,
                            symbol: input.symbol,
                        },
                        output: {
                            decimals: output.decimals,
                            symbol: output.symbol,
                        },
                    }
                    const swappedAmount = inputAmount.toSignificant(6)
                    const receivedAmount = outputAmount.toSignificant(6)
                    const summary = `Swapped ${swappedAmount} ${input.symbol} to ${receivedAmount} ${output.symbol}`
                    const type = input.symbol === 'G$' ? 'sell' : 'buy'

                    sendData({
                        event: 'swap',
                        action: 'swap_confirm',
                        amount: type === 'buy' ? receivedAmount : swappedAmount,
                        tokens: [input.symbol, output.symbol],
                        type,
                        network,
                    })

                    globalDispatch(
                        addTransaction({
                            chainId: 42220 as ChainId,
                            hash: txHash,
                            from: account!,
                            summary: summary,
                            tradeInfo: tradeInfo,
                        })
                    )
                    break
                }
            }
        },
        [account, network]
    )

    const handleTxSuccess: OnTxSuccess = useCallback(
        async (txHash: string, data: any) => {
            const { inputAmount } = data.info.trade.swaps[0]
            const type = inputAmount.currency.symbol === 'G$' ? 'sell' : 'buy'
            sendData({ event: 'swap', action: 'swap_success', type, network })
        },
        [network]
    )

    return (
        <Box w={containerWidth}>
            <SwapWidget
                width={containerWidth}
                tokenList={tokens}
                defaultInputTokenAddress={gdTokenAddress}
                permit2={true}
                jsonRpcUrlMap={jsonRpcUrlMap}
                provider={web3Provider}
                theme={customTheme}
                onConnectWalletClick={connectOnboard}
                onError={handleError}
                onTxFail={handleTxFailed}
                onTxSubmit={handleTxSubmit}
                onTxSuccess={handleTxSuccess}
                dialogOptions={{ pageCentered: !!isMobile }}
            />
        </Box>
    )
}
