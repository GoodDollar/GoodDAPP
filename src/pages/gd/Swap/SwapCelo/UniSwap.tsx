import React, { useCallback } from 'react'

import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useApplicationTheme } from 'state/application/hooks'
import { darkTheme, lightTheme, OnTxFail, OnTxSubmit, OnTxSuccess, SwapWidget, TokenInfo } from '@uniswap/widgets'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useConnectWallet } from '@web3-onboard/react'
import { AsyncStorage, getDevice, G$ContractAddresses, useGetEnvChainId, useWeb3Context } from '@gooddollar/web3sdk-v2'
import { useDispatch } from 'react-redux'
import { addTransaction } from 'state/transactions/actions'
import { ChainId } from '@sushiswap/sdk'

const jsonRpcUrlMap = {
    122: ['https://rpc.fuse.io', 'https://fuse-rpc.gateway.pokt.network'],
    42220: ['https://forno.celo.org', 'https://celo-rpc.gateway.pokt.network'],
}

const celoTokenList: TokenInfo[] = [
    {
        name: 'Wrapped Ether',
        address: '0x2DEf4285787d58a2f811AF24755A8150622f4361',
        symbol: 'WETH',
        decimals: 18,
        chainId: 42220,
        logoURI:
            'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        extensions: {
            bridgeInfo: {
                '1': {
                    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                },
            },
        },
    },
    //todo-fix: adding this native token in the list makes it show up twice. but by default the logo's are not functioning on the widget
    // {
    //     chainId: 42220,
    //     address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    //     name: 'Celo',
    //     symbol: 'CELO',
    //     decimals: 18,
    //     logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_CELO.png',
    // },
]

export const UniSwap = (): JSX.Element => {
    const [theme] = useApplicationTheme()
    const uniTheme = theme === 'dark' ? darkTheme : lightTheme
    const { account } = useActiveWeb3React()
    const { web3Provider } = useWeb3Context()
    const [, connect] = useConnectWallet()
    const globalDispatch = useDispatch()
    const { connectedEnv } = useGetEnvChainId(42220)
    const gdTokenAddress = G$ContractAddresses('GoodDollar', connectedEnv) as string
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

    celoTokenList.push(gdToken)

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
        console.log('handleError -->', { e })
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
        [account]
    )

    const handleTxSuccess: OnTxSuccess = useCallback(async (txHash: string, data: any) => {
        console.log('handleTxSuccess -->', { txHash, data })
        //todo: potentially showing share modal (as we do on other chains when buying G$)
        //     <ShareTransaction
        //     title={i18n._(t`Swap Completed`)}
        //     text={i18n._(
        //         t`You just used your crypto for good to help fund crypto UBI for all with GoodDollar!`
        //     )}
        //     shareProps={{
        //         title: i18n._(t`Share with friends`),
        //         copyText: 'I just bought GoodDollars at https://goodswap.xyz to make the world better',
        //         show: true,
        //         linkedin: {
        //             url: 'https://gooddollar.org',
        //         },
        //         twitter: {
        //             url: 'https://gooddollar.org',
        //             hashtags: ['InvestForGood'],
        //         },
        //         facebook: {
        //             url: 'https://gooddollar.org',
        //             hashtag: '#InvestForGood',
        //         },
        //     }}
        // />
    }, [])

    return (
        <div>
            <SwapWidget
                width="550px"
                tokenList={celoTokenList}
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
            />
        </div>
    )
}
