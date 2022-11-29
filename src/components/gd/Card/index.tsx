import styled from 'styled-components'
import React, { ComponentType, HTMLAttributes, memo } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    contentWrapped?: boolean
    as?: keyof JSX.IntrinsicElements | ComponentType<Partial<Omit<CardProps, 'as'>>>
}

export const CardSC = styled.div`
    padding: 18px 20px;
    background: ${({ theme }) => theme.color.bg1};
    box-shadow: ${({ theme }) => theme.shadow.settings};
    border-radius: 12px;
`
export const CardContentSC = styled.div`
    background: ${({ theme }) => theme.color.main};
    border: 1px solid ${({ theme }) => theme.color.border2};
    border-radius: 12px;
    padding: 16px 20px 20px;
`

const Card = memo(({ children, contentWrapped = true, ...rest }: CardProps) => {
    if (contentWrapped) {
        children = <CardContentSC>{children}</CardContentSC>
    }

    return <CardSC {...rest}>{children}</CardSC>
});

export default Card;
