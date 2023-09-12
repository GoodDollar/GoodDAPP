import React, { memo } from 'react'
import { GoodIdDetails } from '@gooddollar/good-design'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

const GoodId = memo(() => {
    const { account } = useActiveWeb3React()

    return <GoodIdDetails account={account ?? ''} />
})

export default GoodId
