import React, { memo, useState, useEffect, useCallback } from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ClaimButton, ClaimCarousel, IClaimCard, Title } from '@gooddollar/good-design'
import { Text, useBreakpointValue, Box, View } from 'native-base'
import { ClaimBalance } from './ClaimBalance'
import { useClaim, SupportedV2Networks } from '@gooddollar/web3sdk-v2'
import { useConnectWallet } from '@web3-onboard/react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import FirstTimer from 'assets/images/claim/firstimer.png'
import HowWorks from 'assets/images/claim/howitworks.png'
import useSendAnalyticsData from 'hooks/useSendAnalyticsData'
import { QueryParams } from '@usedapp/core'
import { noop } from 'lodash'

const Claim = memo(() => {
    const { i18n } = useLingui()
    const [refreshRate, setRefreshRate] = useState<QueryParams['refresh']>(12)
    const {
        claimAmount,
        claimCall: { state, send, resetState },
    } = useClaim(refreshRate)
    const [claimed, setClaimed] = useState<boolean | undefined>(undefined)
    const [, connect] = useConnectWallet()
    const { chainId } = useActiveWeb3React()
    const network = SupportedV2Networks[chainId]
    const sendData = useSendAnalyticsData()

    // there are three possible scenarios
    // 1. claim amount is 0, meaning user has claimed that day
    // 2. status === success, meaning user has just claimed. Could happen that claimAmount has not been updated right after tx confirmation
    // 3. If neither is true, there is a claim ready for user or its a new user and FV will be triggered instead
    useEffect(() => {
        const hasClaimed = async () => {
            if (claimAmount?.isZero()) {
                setRefreshRate(12)
                setClaimed(true)
                return
            } else if (state.status === 'Success') {
                setClaimed(true)
            } else {
                setClaimed(false)
            }

            setRefreshRate('everyBlock')
            resetState()
        }
        if (claimAmount) hasClaimed().catch(noop)
        // eslint-disable-next-line react-hooks-addons/no-unused-deps
    }, [claimAmount, state, chainId, resetState, setRefreshRate])

    // upon switching chain we want temporarily to poll everyBlock up untill we have the latest data
    useEffect(() => {
        setClaimed(undefined)
        setRefreshRate('everyBlock')
    }, [/* used */ chainId])

    const handleEvents = useCallback(
        (event: string) => {
            switch (event) {
                case 'switch_start':
                    sendData({ event: 'claim', action: 'network_switch_start', network })
                    break
                case 'switch_succes':
                    sendData({ event: 'claim', action: 'network_switch_success', network })
                    break
                case 'action_start':
                    sendData({ event: 'claim', action: 'claim_start', network })
                    break
                case 'finish':
                    sendData({ event: 'claim', action: 'claim_success', network })
                    break
                default:
                    sendData({ event: 'claim', action: event, network })
                    break
            }
        },
        [sendData, network]
    )

    const handleClaim = useCallback(async () => {
        setRefreshRate('everyBlock')
        const claim = await send()
        sendData({ event: 'claim', action: 'claim_success', network })
        if (!claim) {
            return false
        }
        return true
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [send, network, sendData])

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
            width: '100%',
            mb: 2,
        },
        lg: {
            gap: claimed ? '58px' : '32px',
            flexDirection: 'row',
            justifyContent: 'justify-evenly',
        },
    })

    const balanceContainer = useBreakpointValue({
        base: {
            display: 'flex',
            alignItems: 'center',
            width: '369px',
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
                <div className="flex flex-col items-center text-center lg:w-5/12">
                    <Box style={balanceContainer}>
                        {claimed ? (
                            <ClaimBalance refresh={refreshRate} />
                        ) : (
                            <>
                                <Title fontFamily="heading" fontSize="2xl" fontWeight="extrabold" pb="2">
                                    {i18n._(t`Collect G$`)}
                                </Title>

                                <Text
                                    w="340px"
                                    fontFamily="subheading"
                                    fontWeight="normal"
                                    color="goodGrey.500"
                                    fontSize="sm"
                                >
                                    {i18n._(
                                        t`GoodDollar creates free money as a public good, G$ tokens, which you can collect daily.`
                                    )}
                                </Text>
                            </>
                        )}
                        <ClaimButton
                            firstName="Test"
                            method="redirect"
                            claim={handleClaim}
                            claimed={claimed}
                            claiming={state?.status === 'Mining'}
                            handleConnect={handleConnect}
                            chainId={chainId}
                            onEvent={handleEvents}
                        />
                    </Box>
                </div>
                <div
                    className={`w-full lg:flex lg:flex-col ${claimed ? 'lg:w-full' : 'lg:w-6/12'}`}
                    style={{ flexGrow: '1' }}
                >
                    <ClaimCarousel cards={mockedCards} claimed={claimed} />
                </div>
            </View>
        </>
    )
})

export default Claim
