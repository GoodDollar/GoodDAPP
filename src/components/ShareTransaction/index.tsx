import React from 'react'

import Title from 'components/gd/Title'
import { Share, ShareProps } from 'components/Share'

interface ShareTransactionProps {
    title?: string
    text?: string
    children?: React.ReactNode
    shareProps: ShareProps
}

const ShareTransaction = ({ title, text, children, shareProps }: ShareTransactionProps): React.ReactElement => {
    return (
        <>
            {title && <Title className="mb-4 text-center">{title}</Title>}
            {text && <div className="text-center font-normal mb-4">{text}</div>}
            {children}
            <Share {...shareProps} />
        </>
    )
}

export default ShareTransaction
