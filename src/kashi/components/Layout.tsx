import React from 'react'
import styled from 'styled-components'

interface LayoutProps {
    left?: JSX.Element
    children?: React.ReactChild | React.ReactChild[]
    right?: JSX.Element
    netWorth?: string
}

const LayoutSC = styled.div`
    width: 100%;
    padding-left: 5rem;
    padding-right: 1rem;

    @media screen and (max-width: 1250px) {
        padding-left: 1rem;
    }

    @media ${({ theme }) => theme.media.md} {
        padding-left: 0;
        padding-right: 0;
    }
`

const ContentWrapper = styled.div`
    background: ${({ theme }) => theme.color.main};
    box-shadow: ${({ theme }) => theme.shadow.button};
    border-radius: 20px;
    padding: 20px 17px;
`

export default function Layout({
    left = undefined,
    children = undefined,
    right = undefined
}: LayoutProps): JSX.Element {
    return (
        <LayoutSC>
            <ContentWrapper>{children}</ContentWrapper>
        </LayoutSC>
    )
}
