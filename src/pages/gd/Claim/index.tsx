import React, { memo, useState, useEffect, useCallback } from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ClaimButton, ClaimCarousel, IClaimCard, Title } from '@gooddollar/good-design'
import { Text, useBreakpointValue, Box, View } from 'native-base'
import { ClaimBalance } from './ClaimBalance'
import { SupportedChains, useClaim } from '@gooddollar/web3sdk-v2'
import { useConnectWallet } from '@web3-onboard/react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

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
            marginLeft: '120px',
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
            id: 'how-to-claim',
            title: {
                text: 'How to claim G$',
                color: 'primary',
            },
            content: [
                {
                    description: {
                        text: 'First time here? Watch this video to learn the basics about GoodDollar:',
                        color: 'goodGrey.500',
                    },
                },
                {
                    imageUrl:
                        'https://1.bp.blogspot.com/-t6rZyF0sJvc/YCe0-Xx2euI/AAAAAAAADt8/ZVlJPzwtayoLezt1fKE833GRX-n8_MHWwCLcBGAsYHQ/s400-rw/Screenshot_20210213-113418.png',
                },
            ],
            bgColor: 'goodWhite.100',
            hide: claimed,
        },
        {
            id: 'already-claimed',
            title: {
                text: `Claimed today? Time to use your G$. 👀`,
                color: 'white',
            },
            content: [
                {
                    description: {
                        text: `You can use your GoodDollars to buy products, book services, and use DeFi to better your life and the live of others.`,
                        color: 'white',
                    },
                },
                {
                    link: {
                        linkText: 'Buy using G$',
                        linkUrl: 'https://goodmarkets.xyz/',
                    },
                },
            ],
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
                <div className="w-full lg:flex lg:flex-col lg2:w-2/5 xl:w-80">
                    <ClaimCarousel cards={mockedCards} claimed />
                </div>
            </View>
        </>
    )
})

export default Claim
