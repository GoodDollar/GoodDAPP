import styled from 'styled-components'
import React, { ComponentType, HTMLAttributes, memo } from 'react'
import cn from 'classnames'

export interface TitleProps extends HTMLAttributes<HTMLDivElement> {
    type?: 'default' | 'category' | 'popup' | 'field'
    as?: keyof JSX.IntrinsicElements | ComponentType<Partial<Omit<TitleProps, 'as'>>>
}

export const TitleSC = styled.div`
    font-family: ${({ theme }) => theme.font.primary};
    font-style: normal;

    &.default {
        font-weight: bold;
        font-size: 34px;
        line-height: 40px;
        letter-spacing: -0.02em;
        color: ${({ theme }) => theme.color.text4};
    }

    &.category {
        font-weight: 900;
        font-size: 14px;
        line-height: 24px;
        letter-spacing: 0.1px;
        text-transform: uppercase;
        color: ${({ theme }) => theme.color.text5};
    }

    &.field {
        font-weight: bold;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.35px;
        color: ${({ theme }) => theme.color.text5};
    }

    &.popup {
        font-weight: 900;
        font-size: 16px;
        line-height: 24px;
        letter-spacing: 0.1px;
        color: ${({ theme }) => theme.color.text1};
    }
`

const Title = memo(({ children, type = 'default', className, ...rest }: TitleProps) => {
    return (
        <TitleSC className={cn(type, className)} {...rest}>
            {children}
        </TitleSC>
    )
});

export default Title;
