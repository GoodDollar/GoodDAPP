import contractsAddresses from '@gooddollar/goodprotocol/releases/deployment.json'

const map: Record<string, string | undefined> = {
    '0x6acb34b1Df86E254b544189Ec32Cf737e2482058':
        'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png',
    '0x2f60a843302F1Be3FA87429CA9d684f9091b003c':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/dext-logo.png',
    '0x025a4c577198D116Ea499193E6D735FDb2e6E841':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/grt-logo.png',
    '0x43B17749B246fd2a96DE25d9e4184E27E09765b0':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/knc-logo.png',
    '0x0972F26e8943679b043de23df2fD3852177A7c48':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/link-logo.png',
    '0x7F59aE3a787C0d1D640F99883d0e48c22188C54f':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/om-logo.png',
    '0x6a5F6A8121592BeCd6747a38d67451B310F7f156':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/busd-logo.png',
    '0xE1C110E1B1b4A1deD0cAf3E42BfBdbB7b5d7cE1C':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/elk-logo.png',
    '0x8A5eE71Cd4Db6b7ffdCE37313006e48FaD6ADdB0':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/onefuse-logo.png',
    '0x90708b20ccC1eb95a4FA7C8b18Fd2C22a0Ff9E78':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/sushi-logo.png',
    '0x94Ba7A27c7A95863d1bdC7645AC2951E0cca06bA':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    '0x249BE57637D8B013Ad64785404b24aeBaE9B098B': 'https://fuselogo.s3.eu-central-1.amazonaws.com/fuse-dollar.png',
    '0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    '0xFaDbBF8Ce7D5b7041bE672561bbA99f79c532e10':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    '0x33284f95ccb7B948d9D352e1439561CF83d8d00d':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    '0xa722c13135930332Eb3d749B2F0906559D2C5b99':
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629': 'https://fuselogo.s3.eu-central-1.amazonaws.com/wfuse.png',
    '0xA5B0631c5B393d4BF30D2974dF121ea7E8b0e934':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gd-logo.png',
    '0xe39236a9Cf13f65DB8adD06BD4b834C65c523d2b':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gd-logo.png',
    '0x495d133B938596C9984d462F007B676bDc57eCEC':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gd-logo.png',
    '0xb9bEECD1A582768711dE1EE7B0A1d582D9d72a6C':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/good-logo.png',
    '0x80312bad9dd71d3a159e794B7fb1B2386F82F07F':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/good-logo.png',
    '0x3A9299BE789ac3730e4E4c49d6d2Ad1b8BC34DFf':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/good-logo.png'
}

Object.values(contractsAddresses).forEach(
    _ =>
        (map[_['GoodDollar'] as string] =
            'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gd-logo.png')
)
Object.values(contractsAddresses).forEach(
    _ =>
        (map[_['GReputation'] as string] =
            'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/good-logo.png')
)

export const getFuseTokenLogoURL = (address: string): string =>
    map[address] ??
    `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
