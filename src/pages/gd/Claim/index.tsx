import React, { memo, useMemo } from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { BalanceGD, ClaimButton, ClaimCarousel, IClaimCard, Title, useScreenSize } from '@gooddollar/good-design'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useClaim } from '@gooddollar/web3sdk-v2'
import { Text, View } from 'native-base'
import { useClaiming } from 'hooks/useClaiming'
import usePromise from 'hooks/usePromise'
import { g$Price } from '@gooddollar/web3sdk'
import { isToday, format } from 'date-fns'

const mockedCards: Array<IClaimCard> = [
    {
        title: 'How to claim G$',
        content: [
            { description: 'First time here? Watch this video to learn the basics about GoodDollar:' },
            {
                imageUrl:
                    'https://1.bp.blogspot.com/-t6rZyF0sJvc/YCe0-Xx2euI/AAAAAAAADt8/ZVlJPzwtayoLezt1fKE833GRX-n8_MHWwCLcBGAsYHQ/s400-rw/Screenshot_20210213-113418.png',
            },
        ],
    },
    {
        title: 'Claimed today? Time to use your G$. 👀',
        content: [
            {
                description: `You can use your GoodDollars
        to buy products, book services, and use DeFi to better your life and the live of others.`,
            },
            {
                link: {
                    linkText: 'Buy using G$',
                    linkUrl: 'https://google.com',
                },
            },
        ],
    },
    {
        title: 'GoodDollar by numbers',
        content: [
            {
                list: [
                    { key: '🪂 Total UBI Distributed', value: '$327.5k' },
                    { key: '💰 Unique UBI Claimers', value: '$475k' },
                    { key: '🚢  Market Capitalization', value: '$876k' },
                ],
            },
        ],
    },
]

const NextClaim = ({ time }: { time: string }) => {
    const { isSmallScreen } = useScreenSize()
    return (
        <Text
            fontFamily="subheading"
            style={{ fontWeight: '500' }}
            fontSize="sm"
            color={isSmallScreen ? 'white' : 'main'}
        >
            Your next claim will be at {time}
        </Text>
    )
}

const Claim = memo(() => {
    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()
    const { claimed, handleClaim } = useClaiming()
    const { claimTime } = useClaim('everyBlock')

    const [G$Price] = usePromise(async () => {
        try {
            const data = await g$Price()
            return data.DAI
        } catch {
            return undefined
        }
    }, [chainId])

    const formattedTime = useMemo(
        () => claimed && (isToday(claimTime) ? 'today' : 'tomorrow') + ' ' + format(claimTime, 'hh aaa'),
        [claimed, claimTime]
    )

    const { isSmallScreen } = useScreenSize()

    return (
        <>
            {claimed && isSmallScreen && (
                <View
                    py="1"
                    bg="main"
                    position="absolute"
                    top="76"
                    left={isSmallScreen ? '0' : '268'}
                    right="0"
                    alignItems="center"
                    zIndex={100}
                >
                    <NextClaim time={formattedTime || ''} />
                </View>
            )}
            <div className="flex flex-col items-center justify-center flex-grow w-full lg2:flex-row lg:px-10 lg2:px-20 xl:px-40">
                <div className="flex flex-col lg:w-1/3 lg:px-4">
                    {claimed ? (
                        <>
                            <BalanceGD gdPrice={G$Price} />
                            {!isSmallScreen && (
                                <View backgroundColor="main:alpha.20" borderRadius="md" p="1" textAlign="center">
                                    <NextClaim time={formattedTime || ''} />
                                </View>
                            )}
                        </>
                    ) : (
                        <>
                            <Title fontFamily="heading" fontWeight="700" pb="2">
                                {i18n._(t`Claim UBI`)}
                            </Title>

                            <Text fontFamily="subheading" fontWeight="400" color="lightGrey" fontSize="md">
                                {i18n._(t`UBI is your fair share of G$ tokens, which you can claim daily on CELO.`)}
                            </Text>
                        </>
                    )}

                    <div className="flex items-center">
                        {account ? (
                            <ClaimButton firstName="Test" method="redirect" claim={handleClaim} claimed={claimed} />
                        ) : (
                            <Text w="full" textAlign="center" px="2.5" py="40" bold fontSize="lg">
                                {i18n._(t`CONNECT A WALLET TO CLAIM YOUR GOODDOLLARS`)}
                            </Text>
                        )}
                    </div>
                </div>
                <div className="lg:flex lg:flex-col lg:w-4/5 lg2:w-2/5 xl:w-80">
                    <ClaimCarousel cards={mockedCards} />
                </div>
            </div>
        </>
    )
})

export default Claim
