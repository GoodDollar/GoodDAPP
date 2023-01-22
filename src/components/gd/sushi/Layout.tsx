import React from 'react'
import styled from 'styled-components'

interface LayoutProps {
    left?: JSX.Element
    children?: React.ReactNode | React.ReactNode[]
    right?: JSX.Element
    netWorth?: string
    classes?: string
    wrapperClasses?: string
}

const LayoutSC = styled.div`
    width: 100%;
    margin-left: 1.25rem;
    padding-right: 1rem;

    @media screen and (max-width: 1250px) {
        padding-left: 1rem;
    }

    @media ${({ theme }) => theme.media.md} {
        padding-left: 0;
        padding-right: 0;
    }

    @media screen and (max-height: 665px) {
        margin-top: 7rem;
    }
`

const ContentWrapper = styled.div`
    background: ${({ theme }) => theme.color.main};
    box-shadow: ${({ theme }) => theme.shadow.button};
    border-radius: 20px;
    padding: 20px 17px;
`

export default function Layout({
    children = undefined,
    classes = undefined,
    wrapperClasses = undefined,
}: LayoutProps): JSX.Element {
    return (
        <LayoutSC className={classes}>
            <ContentWrapper className={wrapperClasses}>{children}</ContentWrapper>
        </LayoutSC>
    )
}
