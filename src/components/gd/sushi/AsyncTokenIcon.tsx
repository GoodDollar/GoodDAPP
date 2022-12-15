import React, { useEffect, useState } from 'react'

import { ChainId } from '@sushiswap/sdk'
import Circle from 'assets/images/blue-loader.svg'
import { CustomLightSpinner } from 'theme'
import { getTokenLogoURL as getTokenIconUrl } from 'components/CurrencyLogo'
import { BAD_SRCS } from 'components/Logo'

const AsyncTokenIcon = ({
    address,
    chainId,
    className,
    network,
}: {
    address: string
    chainId?: ChainId
    className?: string
    network?: string
}): JSX.Element => {
    const [loadedSrc, setLoadedSrc] = useState<string>()

    // Address gets changed after chainId so only run this on address change
    // to avoid missing token icon error on chainId change
    useEffect(() => {
        setLoadedSrc('')
        if (!(address && chainId)) return
        if (BAD_SRCS[address]) {
            setLoadedSrc(`${process.env.PUBLIC_URL}/images/tokens/unknown.png`)
            return
        }

        const src = getTokenIconUrl(address, chainId)
        const image = new Image()

        const handleLoad = () => {
            setLoadedSrc(src)
        }

        image.addEventListener('load', handleLoad)
        image.onerror = () => {
            BAD_SRCS[address] = true
            setLoadedSrc(`${process.env.PUBLIC_URL}/images/tokens/unknown.png`)
        }
        image.src = src
        return () => {
            image.removeEventListener('load', handleLoad)
        }
    }, [chainId, address])

    return loadedSrc ? (
        <img
            src={loadedSrc}
            className={className}
            style={
                network === 'fuse' || network === 'GoodDAO' ? { backgroundColor: 'white', borderRadius: '30px' } : {}
            }
            alt=""
        />
    ) : (
        <div className={[className, 'flex justify-center items-center ray-900'].join(' ')}>
            <CustomLightSpinner src={Circle} alt="loader" size={'24px'} />
        </div>
    )
}

export default AsyncTokenIcon
