import React, { FC, useCallback, useState } from 'react'
import { HelpCircle as Question } from 'react-feather'
import styled from 'styled-components'
import Tooltip, { TooltipProps } from '../Tooltip'

const QuestionWrapper = styled.div<{ noPadding?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${props => (props.noPadding ? '0' : '0.2rem')};
    border: none;
    background: none;
    outline: none;
    cursor: default;
    border-radius: 36px;
    // background-color: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.color.text2};

    :hover,
    :focus {
        opacity: 0.7;
    }
`

const LightQuestionWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.2rem;
    border: none;
    background: none;
    outline: none;
    cursor: default;
    border-radius: 36px;
    width: 24px;
    height: 24px;
    background-color: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.white};

    :hover,
    :focus {
        opacity: 0.7;
    }
`

const QuestionMark = styled.span`
    font-size: 1rem;
`

const QuestionHelper: FC<Omit<TooltipProps, 'show' | 'children'>> = ({ children, text, ...rest }) => {
    const [show, setShow] = useState<boolean>(false)

    const open = useCallback(() => setShow(true), [setShow])
    const close = useCallback(() => setShow(false), [setShow])

    if (children) {
        return (
            <Tooltip text={text} show={show} {...rest}>
                <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close} noPadding>
                    {children}
                </QuestionWrapper>
            </Tooltip>
        )
    }

    return (
        <Tooltip text={text} show={show}>
            <QuestionWrapper style={{ marginLeft: 4 }} onClick={open} onMouseEnter={open} onMouseLeave={close}>
                <Question size={14} />
            </QuestionWrapper>
        </Tooltip>
    )
}

export default QuestionHelper
