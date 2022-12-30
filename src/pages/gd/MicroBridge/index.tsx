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
        title: 'Attention!',
        content: [
            {
                list: [
                    { key: '⚠️ Microbridge fee is', value: '0.1%' },
                    { key: '⚠️ Minimum fee is', value: '1 G$' },
                    { key: '⚠️ Maximum fee is', value: '10 G$' },
                ],
            },
        ],
    },
    {
        title: 'Watch this video to learn more about bridging',
        content: [
            { description: 'First time here? Watch this video to learn the basics about bridging:' },
            {
                imageUrl:
                    'https://1.bp.blogspot.com/-t6rZyF0sJvc/YCe0-Xx2euI/AAAAAAAADt8/ZVlJPzwtayoLezt1fKE833GRX-n8_MHWwCLcBGAsYHQ/s400-rw/Screenshot_20210213-113418.png',
            },
        ],
    },
    {
        title: 'Need to bridge larger amounts?',
        content: [
            {
                description: `Bridge between all chains that support G$ at multichain.org`,
            },
            {
                link: {
                    linkText: 'Bridge now',
                    linkUrl: 'https://multichain.org',
                },
            },
        ],
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
