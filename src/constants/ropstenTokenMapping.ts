const map: Record<string, string | undefined> = {
    '0xaD6D458402F60fD3Bd25163575031ACDce07538D': 'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_DAI.svg',
    '0xc778417E063141139Fce010982780140Aa0cD5Ab': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    '0xd76135e33B9ee4F1bF1D57Ec18bBBC11AFf30941': 'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gd-logo.png',
    '0x4738C5e91C4F809da21DD0Df4B5aD5f699878C1c': 'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gd-logo.png',
    '0x510cB2b741bf8CE109Ef2a807dbA8E38368194E6': 'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gdx-logo.png',
    '0x11c736655DF25e37D16D3D63dfbc68E2bE9Ad603': 'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/gdx-logo.png',
    '0x01C4094f179721155D800094821cf0478943B7B8': 'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/good-logo.png',
    '0x9d527F4509f5d80bb23611B69b28a3809D04ecd4': 'https://raw.githubusercontent.com/GoodDollar/GoodProtocolUI/master/src/assets/images/tokens/good-logo.png'
}

export const getRopstenTokenLogoURL = (address: string): string =>
    map[address] ?? `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
