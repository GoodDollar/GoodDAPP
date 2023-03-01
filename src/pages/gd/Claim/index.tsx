import React, { memo, useState, useEffect, useCallback } from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ClaimButton, ClaimCarousel, IClaimCard, Title } from '@gooddollar/good-design'
import { Text, useBreakpointValue, Box, View } from 'native-base'
import { ClaimBalance } from './ClaimBalance'
import { SupportedChains, useClaim } from '@gooddollar/web3sdk-v2'
import { useConnectWallet } from '@web3-onboard/react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import FirstTimer from 'assets/images/claim/firstimer.png'
import HowWorks from 'assets/images/claim/howitworks.png'

const Claim = memo(() => {
    const { i18n } = useLingui()
    const {
        claimAmount,
        claimCall: { state, send },
    } = useClaim()
    const [claimed, setClaimed] = useState(false)
    const [, connect] = useConnectWallet()
    const { chainId } = useActiveWeb3React()
    const network = SupportedChains[chainId]

    useEffect(() => {
        //todo: add event analytics on transaction status
        if (claimAmount?.isZero() || state.status === 'Success') {
            setClaimed(true)
        } else {
            setClaimed(false)
        }
    }, [claimAmount, state, send])

    const handleClaim = useCallback(async () => {
        const claim = await send()

        if (!claim) {
            return false
        }

        // todo: add event analytics on transaction receipt
        setClaimed(true)
        return true
    }, [send])

    const handleConnect = useCallback(async () => {
        const state = await connect()

        return !!state.length
    }, [connect])

    const mainView = useBreakpointValue({
        base: {
            gap: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
            width: 'full',
            mb: 2,
        },
        lg: {
            gap: '56px',
            flexDirection: 'row',
            justifyContent: 'justify-evenly',
        },
    })

    const balanceContainer = useBreakpointValue({
        base: {
            display: 'flex',
            alignItems: 'center',
        },
    })

    const mockedCards: Array<IClaimCard> = [
        {
            id: 'how-does-work',
            title: {
                text: 'How does it work?',
                color: 'primary',
            },
            content: [
                {
                    subTitle: {
                        text: 'Free money, no catch, all thanks to technology.',
                        color: 'goodGrey.500',
                    },
                },
                {
                    description: {
                        text: 'Learn more about how the GoodDollar protocol works here.',
                        color: 'goodGrey.500',
                    },
                },
                {
                    imgSrc: HowWorks,
                },
            ],
            externalLink: 'https://www.notion.so/gooddollar/GoodDollar-Protocol-2cc5c26cf09d40469e4570ad1d983914',
            bgColor: 'goodWhite.100',
            hide: claimed,
        },
        {
            id: 'how-to-collect',
            title: {
                text: 'How to collect G$',
                color: 'primary',
            },
            content: [
                {
                    subTitle: {
                        text: 'First time here?',
                        color: 'goodGrey.500',
                    },
                },
                {
                    description: {
                        text: 'Anyone in the world can collect G$. Create a wallet to get started.',
                        color: 'goodGrey.500',
                    },
                },
                {
                    imgSrc: FirstTimer,
                },
            ],
            externalLink: 'https://www.notion.so/Get-G-873391f31aee4a18ab5ad7fb7467acb3',
            bgColor: 'goodWhite.100',
            hide: claimed,
        },
        {
            id: 'already-claimed',
            title: {
                text: `Use 
your G$. 🙂`,
                color: 'white',
            },
            content: [
                {
                    description: {
                        text: `After claiming your G$, use it to support your community, buy products and services, support causes you care about, vote in the GoodDAO, and more. Learn how here`,
                        color: 'white',
                    },
                },
            ],
            externalLink: 'https://www.notion.so/gooddollar/Use-G-8639553aa7214590a70afec91a7d9e73',
            bgColor: 'primary',
        },
        {
            id: 'gd-by-numbers',
            title: {
                text: 'GoodDollar by numbers',
                color: 'primary',
            },
            content: [
                {
                    list: [
                        {
                            id: 'number-countries',
                            key: '🌏 Number of Countries',
                            value: '#',
                        },
                        {
                            id: 'tokens-claimed',
                            key: '✋🏽 Number of G$ Tokens Claimed',
                            value: '#',
                        },
                        {
                            id: 'total-distributed',
                            key: '🪂 Total UBI Distributed',
                            value: '$327.5k',
                        },
                        {
                            id: 'unique-claimers',
                            key: '💰 Unique UBI Claimers',
                            value: '$475k',
                        },
                        {
                            id: 'market-capitalization',
                            key: '🚢  Market Capitalization',
                            value: '$876k',
                        },
                    ],
                },
            ],
            externalLink: 'https://dashboard.gooddollar.org',
            bgColor: 'goodWhite.100',
        },
    ]

    return (
        <>
            <View style={mainView}>
                <div className="flex flex-col text-center lg:w-5/12">
                    <Box style={balanceContainer}>
                        {claimed ? (
                            <ClaimBalance />
                        ) : (
                            <>
                                <Title fontFamily="heading" fontSize="2xl" fontWeight="extrabold" pb="2">
                                    {i18n._(t`Claim G$`)}
                                </Title>

                                <Text fontFamily="subheading" fontWeight="normal" color="goodGrey.500" fontSize="sm">
                                    {i18n._(
                                        t`UBI is your fair share of G$ tokens, which you can claim daily on ${network}.`
                                    )}
                                </Text>
                            </>
                        )}
                        <ClaimButton
                            firstName="Test"
                            method="redirect"
                            claim={handleClaim}
                            claimed={claimed}
                            handleConnect={handleConnect}
                            chainId={chainId}
                        />
                    </Box>
                </div>
                <div className="w-full lg:flex lg:flex-col lg2:w-2/5" style={{ flexGrow: '1' }}>
                    <ClaimCarousel cards={mockedCards} claimed />
                </div>
            </View>
        </>
    )
})

export default Claim
