import React, { memo } from 'react'
import styled from 'styled-components'

const PlaceholderSC = styled.div`
    background: ${({ theme }) => theme.color.bg2};
    border-radius: 6px;
    color: ${({ theme }) => theme.color.rangeTrack};
    font-style: normal;
    font-weight: bold;
    font-size: 14px;
    line-height: 166%;
    letter-spacing: 0.35px;
    text-transform: uppercase;
    padding: 40px 34px 34px 34px;
    display: flex;
    justify-content: center;
`

const Placeholder = memo(({ children, ...props }: Omit<JSX.IntrinsicElements['div'], 'ref'>) => {
    return <PlaceholderSC {...props}>{children}</PlaceholderSC>
})

export default Placeholder;
