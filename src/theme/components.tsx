import { darken } from 'polished'
import React, { HTMLProps, useCallback } from 'react'
import { ArrowLeft, ExternalLink as LinkIconFeather, Trash } from 'react-feather'

import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'

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

const StyledLink = styled.a`
    text-decoration: none;
    cursor: pointer;
    color: #0094ec;
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

const LinkIconWrapper = styled.a`
    text-decoration: none;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    display: flex;

    :hover {
        text-decoration: none;
        opacity: 0.7;
    }

    :focus {
        outline: none;
        text-decoration: none;
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

/**
 * Outbound link that handles firing google analytics events
 */
export function ExternalLink({
    target = '_blank',
    href,
    rel = 'noopener noreferrer',
    ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & { href: string }) {
    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>) => {
            // don't prevent default, don't redirect if it's a new tab
            if (target === '_blank' || event.ctrlKey || event.metaKey) {
                /* empty */
            } else {
                event.preventDefault()
                // send a ReactGA event and then trigger a location change
            }
        },
        [href, target]
    )
    return <StyledLink target={target} rel={rel} href={href} onClick={handleClick} {...rest} />
}

export function ExternalLinkIcon({
    target = '_blank',
    href,
    rel = 'noopener noreferrer',
    ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & { href: string }) {
    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>) => {
            // don't prevent default, don't redirect if it's a new tab
            if (target === '_blank' || event.ctrlKey || event.metaKey) {
                /* empty */
            } else {
                event.preventDefault()
                // send a ReactGA event and then trigger a location change
            }
        },
        [href, target]
    )
    return (
        <LinkIconWrapper target={target} rel={rel} href={href} onClick={handleClick} {...rest}>
            <LinkIcon />
        </LinkIconWrapper>
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

const BackArrowLink = styled(StyledInternalLink)`
    color: ${({ theme }) => theme.text1};
`
export function BackArrow({ to }: { to: string }) {
    return (
        <BackArrowLink to={to}>
            <ArrowLeft />
        </BackArrowLink>
    )
}

export const CustomLightSpinner = styled(Spinner)<{ size: string }>`
    height: ${({ size }) => size};
    width: ${({ size }) => size};
`

export const HideSmall = styled.span`
    ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

export const HideExtraSmall = styled.span`
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

export const ExtraSmallOnly = styled.span`
    display: none;
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: block;
  `};
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
