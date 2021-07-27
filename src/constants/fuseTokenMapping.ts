export const getFuseTokenLogoURL = (address: string) => {
    let uri

    if (address?.toLowerCase() === '0x495d133B938596C9984d462F007B676bDc57eCEC'.toLowerCase()) {
        uri =
            'https://raw.githubusercontent.com/mul53/token-assets/main/assets/etheruem/0x67c5870b4a41d4ebef24d2456547a03f1f3e094b/logo.png'
    }

    // DAI
    if (address?.toLowerCase() === '0x94Ba7A27c7A95863d1bdC7645AC2951E0cca06bA'.toLowerCase()) {
        uri =
            'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png'
    }

    // fUSD
    if (address?.toLowerCase() === '0x249BE57637D8B013Ad64785404b24aeBaE9B098B'.toLowerCase()) {
        uri = 'https://fuselogo.s3.eu-central-1.amazonaws.com/fuse-dollar.png'
    }

    // USDC
    if (address?.toLowerCase() === '0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5'.toLowerCase()) {
        uri =
            'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
    }

    // USDT
    if (address?.toLowerCase() === '0xFaDbBF8Ce7D5b7041bE672561bbA99f79c532e10'.toLowerCase()) {
        uri =
            'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png'
    }

    // WTBC
    if (address?.toLowerCase() === '0x33284f95ccb7B948d9D352e1439561CF83d8d00d'.toLowerCase()) {
        uri =
            'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png'
    }

    // WETH
    if (address?.toLowerCase() === '0xa722c13135930332Eb3d749B2F0906559D2C5b99'.toLowerCase()) {
        uri =
            'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
    }

    // WFUSE
    if (address?.toLowerCase() === '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629'.toLowerCase()) {
        uri = 'https://fuselogo.s3.eu-central-1.amazonaws.com/wfuse.png'
    }

    if (!uri) {
        uri = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
    }

    return uri
}
