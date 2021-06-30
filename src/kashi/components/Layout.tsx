import React from 'react'
import styled from 'styled-components'

interface LayoutProps {
    left?: JSX.Element
    children?: React.ReactChild | React.ReactChild[]
    right?: JSX.Element
    netWorth?: string
}

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
        <div className="w-full pr-4 pl-20">
            <ContentWrapper>{children}</ContentWrapper>
        </div>
    )
}
