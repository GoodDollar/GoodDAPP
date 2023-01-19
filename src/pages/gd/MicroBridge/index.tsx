import React, { memo } from 'react'
import {
    SwitchChainModal,
    WalletAndChainGuard,
    ClaimCarousel,
    MicroBridgeController,
    IClaimCard,
} from '@gooddollar/good-design'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

const mockedCards: Array<IClaimCard> = [
    {
        id: 'attention',
        title: {
            text: 'Attention!',
            color: 'primary',
        },
        content: [
            {
                list: [
                    {
                        id: 'bridge-fee',
                        key: '⚠️ Microbridge fee is',
                        value: '0.1%',
                    },
                    {
                        id: 'min-fee',
                        key: '⚠️ Minimum fee is',
                        value: '1 G$',
                    },
                    {
                        id: 'max-fee',
                        key: '⚠️ Maximum fee is',
                        value: '10 G$',
                    },
                ],
            },
        ],
        bgColor: 'goodWhite.100',
    },
    {
        id: 'watch-vid',
        title: {
            text: 'Watch this video to learn more about bridging',
            color: 'white',
        },
        content: [
            {
                description: {
                    text: 'First time here? Watch this video to learn the basics about bridging:',
                    color: 'white',
                },
            },
            {
                imageUrl:
                    'https://1.bp.blogspot.com/-t6rZyF0sJvc/YCe0-Xx2euI/AAAAAAAADt8/ZVlJPzwtayoLezt1fKE833GRX-n8_MHWwCLcBGAsYHQ/s400-rw/Screenshot_20210213-113418.png',
            },
        ],
        bgColor: 'primary',
    },
    {
        id: 'need-to-bridge',
        title: {
            text: 'Need to bridge larger amounts?',
            color: 'primary',
        },
        content: [
            {
                description: {
                    text: `Bridge between all chains that support G$ at multichain.org`,
                    color: 'primary',
                },
            },
            {
                link: {
                    linkText: 'Bridge now',
                    linkUrl: 'https://multichain.org',
                },
            },
        ],
        bgColor: 'goodWhite.100',
    },
]

const MicroBridge = memo(() => {
    const { account } = useActiveWeb3React()

    return (
        <div className="rounded p-14">
            {account && (
                <>
                    <SwitchChainModal>
                        <WalletAndChainGuard validChains={[122, 42220]}>
                            <MicroBridgeController withRelay={false} />
                        </WalletAndChainGuard>
                    </SwitchChainModal>
                </>
            )}
            <div className="lg:flex lg:flex-col lg:w-4/5 lg2:w-2/5 xl:w-80">
                <ClaimCarousel cards={mockedCards} />
            </div>
        </div>
    )
})

export default MicroBridge
