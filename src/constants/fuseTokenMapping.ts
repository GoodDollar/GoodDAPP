const map: Record<string, string | undefined> = {
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
    '0xeE724540706296ebad65aeA2515Efe0949F97Ae6':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gd-logo.png',
    '0x100b8fd10ff8DC43fda45E636B4BB1eE6088270a':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gd-logo.png',
    '0x495d133B938596C9984d462F007B676bDc57eCEC':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gd-logo.png',
    '0x0Fce4a964F2b69a6cD82c3FB40C101863091A5a7':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/good-logo.png',
    '0xf4467Ad0c9D7D0446B379fE6217111a4690066D1':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/good-logo.png',
    '0x3A9299BE789ac3730e4E4c49d6d2Ad1b8BC34DFf':
        'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/good-logo.png'
}

export const getFuseTokenLogoURL = (address: string): string =>
    map[address] ??
    `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
