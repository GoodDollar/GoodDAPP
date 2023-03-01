import { darken } from 'polished'
import React from 'react'
import { ExternalLink as LinkIconFeather, Trash } from 'react-feather'

import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import useSendAnalyticsData from '../hooks/useSendAnalyticsData'
import { Pressable, useColorModeValue } from 'native-base'

export const ButtonText = styled.button`
    outline: none;
    border: none;
    font-size: inherit;
    padding: 0;
    margin: 0;
    background: none;
    cursor: pointer;

    :hover {
        opacity: 0.7;
    }

    :focus {
        text-decoration: underline;
    }
`

export const Button = styled.button.attrs<{ warning: boolean }, { backgroundColor: string }>(({ warning, theme }) => ({
    backgroundColor: warning ? theme.red1 : theme.primary1,
}))`
    padding: 1rem 2rem 1rem 2rem;
    border-radius: 3rem;
    cursor: pointer;
    user-select: none;
    font-size: 1rem;
    border: none;
    outline: none;
    background-color: ${({ backgroundColor }) => backgroundColor};
    color: ${({ theme }) => theme.white};
    width: 100%;

    :hover,
    :focus {
        background-color: ${({ backgroundColor }) => darken(0.05, backgroundColor)};
    }

    :active {
        background-color: ${({ backgroundColor }) => darken(0.1, backgroundColor)};
    }

    :disabled {
        background-color: ${({ theme }) => theme.bg1};
        color: ${({ theme }) => theme.text4};
        cursor: auto;
    }
`

const CloseSVG = (props: JSX.IntrinsicElements['svg']) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M8.62728 10.5215L5.30765 13.8411L3.48842 12.0219L6.80805 8.70224L3.31963 5.21382L5.21388 3.31957L8.7023 6.80799L12.0219 3.48836L13.8412 5.30759L10.5215 8.62722L14.01 12.1156L12.1157 14.0099L8.62728 10.5215Z"
            fill="#696D73"
        />
    </svg>
)

const ExternalIcon = (props: any) => (
    <svg
        data-key={props.dataAttr}
        className="ml-2"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.4444 11.6667V7C12.4444 6.57067 12.792 6.22222 13.2221 6.22222C13.6523 6.22222 13.9999 6.57067 13.9999 7V11.6667C13.9999 12.9531 12.953 14 11.6666 14H2.33332C1.04688 14 0 12.9531 0 11.6667V2.33333C0 1.04689 1.04688 0 2.33332 0H6.99996C7.43007 0 7.77773 0.348444 7.77773 0.777778C7.77773 1.20711 7.43007 1.55556 6.99996 1.55556H2.33332C1.90399 1.55556 1.55555 1.90478 1.55555 2.33333V11.6667C1.55555 12.0952 1.90399 12.4444 2.33332 12.4444H11.6666C12.0959 12.4444 12.4444 12.0952 12.4444 11.6667ZM11.3385 1.56178L10.1073 1.55556C9.67716 1.55322 9.33105 1.20322 9.33338 0.773889C9.33571 0.345333 9.68338 0 10.1112 0H10.115L13.2238 0.0155556C13.6516 0.0178889 13.9977 0.364778 13.9977 0.792556L14 3.88811C14 4.31822 13.6524 4.66667 13.223 4.66667H13.2222C12.7929 4.66667 12.4445 4.319 12.4445 3.88967L12.4437 2.65611L7.54995 7.54989C7.39828 7.70156 7.19917 7.77778 7.00006 7.77778C6.80095 7.77778 6.60184 7.70156 6.45017 7.54989C6.14606 7.24578 6.14606 6.75422 6.45017 6.45011L11.3385 1.56178Z"
            fill={props.fillColor}
        />
    </svg>
)

export const CloseIcon = styled(CloseSVG)<{ abs?: boolean }>`
    cursor: pointer;
    ${({ abs }) =>
        abs
            ? `
      position: absolute;
      top: 18px;
      right: 18px;
    `
            : ''}
`

// for wrapper react feather icons
export const IconWrapper = styled.div<{ stroke?: string; size?: string; marginRight?: string; marginLeft?: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${({ size }) => size ?? '20px'};
    height: ${({ size }) => size ?? '20px'};
    margin-right: ${({ marginRight }) => marginRight ?? 0};
    margin-left: ${({ marginLeft }) => marginLeft ?? 0};
    & > * {
        stroke: ${({ theme, stroke }) => stroke ?? theme.blue1};
    }
`

// A button that triggers some onClick result, but looks like a link.
export const LinkStyledButton = styled.button<{ disabled?: boolean }>`
    border: none;
    text-decoration: none;
    background: none;

    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
    color: ${({ theme, disabled }) => (disabled ? theme.text2 : theme.primary1)};
    font-weight: 500;

    :hover {
        text-decoration: ${({ disabled }) => (disabled ? null : 'underline')};
    }

    :focus {
        outline: none;
        text-decoration: ${({ disabled }) => (disabled ? null : 'underline')};
    }

    :active {
        text-decoration: none;
    }
`

// An internal link from the react-router-dom library that is correctly styled
export const StyledInternalLink = styled(Link)`
    text-decoration: none;
    cursor: pointer;
    color: ${({ theme }) => theme.primary1};
    font-weight: 500;

    :hover {
        text-decoration: underline;
    }

    :focus {
        outline: none;
        text-decoration: underline;
    }

    :active {
        text-decoration: none;
    }
`

export const LinkIcon = styled(LinkIconFeather)`
    height: 16px;
    width: 18px;
    margin-left: 10px;
    stroke: ${({ theme }) => theme.blue1};
`

export const TrashIcon = styled(Trash)`
    height: 16px;
    width: 18px;
    margin-left: 10px;
    stroke: ${({ theme }) => theme.text3};

    cursor: pointer;
    align-items: center;
    justify-content: center;
    display: flex;

    :hover {
        opacity: 0.7;
    }
`

const rotateImg = keyframes`
  0% {
    transform: perspective(1000px) rotateY(0deg);
  }

  100% {
    transform: perspective(1000px) rotateY(360deg);
  }
`

export const UniTokenAnimated = styled.img`
    animation: ${rotateImg} 5s cubic-bezier(0.83, 0, 0.17, 1) infinite;
    padding: 2rem 0 0 0;
    filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.15));
`

export const ExternalLink: React.FC<{
    url: string
    dataAttr: string
    label?: string
    withIcon?: boolean
    withDefaultStyles?: boolean
    children?: React.ReactNode
}> = ({ url, dataAttr, label, withDefaultStyles, withIcon, children }) => {
    const sendData = useSendAnalyticsData()
    const textColor = useColorModeValue('goodGrey.700', 'goodGrey.300')

    const onExternalClick = (e: any) => {
        const key = e.target.getAttribute('data-key')

        sendData({ event: 'goto_page', action: `goto_${key}` })
    }

    return (
        <Pressable
            _hover={{ bg: 'primary:alpha.10' }}
            _pressed={{ bg: 'primary', color: 'white' }}
            bg="transparent"
            py={2}
            px={2}
            borderRadius="12px"
            color={textColor}
        >
            {({ isPressed }) => (
                <a
                    className={`${withDefaultStyles && 'hover:underline'} pr-2 line 
                     xl:pr-3 whitespace-nowrap flex flex-row items-center`}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={onExternalClick}
                    data-key={dataAttr}
                >
                    {label && <span data-key={dataAttr}>{label}</span>}
                    {withIcon && <ExternalIcon dataAttr={dataAttr} fillColor={isPressed ? 'white' : '#00B0FF'} />}
                    {children}
                </a>
            )}
        </Pressable>
    )
}

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const Spinner = styled.img`
    animation: 2s ${rotate} linear infinite;
    width: 16px;
    height: 16px;
`

export const CustomLightSpinner = styled(Spinner)<{ size: string }>`
    height: ${({ size }) => size};
    width: ${({ size }) => size};
`

const loading = keyframes`
  0%{
    left: -45%;
  }
  100%{
    left: 100%;
  }
`

export const LoadWrapper = styled.div`
    position: relative;
    height: 100%;
    width: 100%;
    background-color: #eef0f9;
    z-index: 1;
    overflow: hidden;
    border-radius: 5px;
`

export const LoadActivity = styled.div`
    position: absolute;
    left: -45%;
    height: 100%;
    width: 45%;
    background-image: ${({ theme }) => theme.gradient.loadingGradient};
    background-image: ${({ theme }) => theme.gradient.loadingGradient};
    background-image: ${({ theme }) => theme.gradient.loadingGradient};
    animation: ${loading} 1s infinite;
    z-index: 45;
`

export const LoadBar = styled.div`
    margin-left: 10px;
    height: 12px;
    width: 60%;
    margin-top: 5px;
`

export function LoadingPlaceHolder(): JSX.Element {
    return (
        <LoadBar>
            <LoadWrapper>
                <LoadActivity />
            </LoadWrapper>
        </LoadBar>
    )
}

const SkCircle = styled.div`
    width: 25px;
    height: 25px;
    position: relative;
`

const CircleBounce = keyframes`
  0%, 80%, 100% {
    -webkit-transform: scale(0);
            transform: scale(0);
  } 40% {
    -webkit-transform: scale(1);
            transform: scale(1);
  }
`

const SkCircleChild = styled.div<{ childNumber?: number; delay?: number }>`
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;

    &:before {
        content: '';
        display: block;
        margin: 0 auto;
        width: 15%;
        height: 15%;
        background-color: #8f9bb3;
        border-radius: 100%;
        -webkit-animation: ${CircleBounce} 1.2s infinite ease-in-out both;
        animation: ${CircleBounce} 1.2s infinite ease-in-out both;
        animation-delay: -${({ delay }) => delay}s;
    }

    transform: rotate(${({ childNumber }) => (childNumber ? childNumber * 30 : '')}deg);
`

export function Calculating(): JSX.Element {
    return (
        <>
            <SkCircle>
                <SkCircleChild></SkCircleChild>
                {Array.apply(1, Array(12)).map(function (x, i) {
                    return (
                        <SkCircleChild
                            key={'child-' + i}
                            childNumber={i}
                            delay={1.2 - parseFloat('0.' + i)}
                        ></SkCircleChild>
                    )
                })}
            </SkCircle>
            <span className="ml-1.5" style={{ fontSize: '15px', color: '#8f9bb3' }}>
                Calculating...
            </span>
        </>
    )
}
