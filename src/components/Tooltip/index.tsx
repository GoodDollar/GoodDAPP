import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Popover, { PopoverProps } from '../Popover'

const TooltipContainer = styled.div`
    width: 228px;
    padding: 18px 20px;
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 19px;
    color: ${({ theme }) => theme.color.text1};
`

interface TooltipProps extends Omit<PopoverProps, 'content'> {
    text: string
}

export default function Tooltip({ text, ...rest }: TooltipProps) {
    return <Popover content={<TooltipContainer>{text}</TooltipContainer>} {...rest} />
}

export function MouseoverTooltip({ children, ...rest }: Omit<TooltipProps, 'show'>) {
    const [show, setShow] = useState(false)
    const open = useCallback(() => setShow(true), [])
    const close = useCallback(() => setShow(false), [])
    return (
        <Tooltip {...rest} show={show}>
            <div onMouseEnter={open} onMouseLeave={close}>
                {children}
            </div>
        </Tooltip>
    )
}
