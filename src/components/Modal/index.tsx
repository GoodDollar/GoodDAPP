import { DialogContent, DialogOverlay } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { transparentize } from 'polished'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { animated, useSpring, useTransition } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import styled, { css } from 'styled-components'

const AnimatedDialogOverlay = animated(DialogOverlay)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
    &[data-reach-dialog-overlay] {
        z-index: 10;
        background-color: transparent;
        overflow: hidden;

        display: flex;
        align-items: center;
        justify-content: center;

        background-color: ${({ theme }) => theme.modalBG};
    }
`

const AnimatedDialogContent = animated(DialogContent)
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogContent = styled(({ minHeight, maxHeight, mobile, maxWidth, isOpen, ...rest }) => (
    <AnimatedDialogContent {...rest} />
)).attrs({
    'aria-label': 'dialog'
})`
    position: relative;
    overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};

    .modal-close {
        position: absolute;
        color: ${({ theme }) => theme.color.text8};
        top: 15px;
        right: 14px;
    }

    &[data-reach-dialog-content] {
        margin: 0 0 2rem 0;
        background-color: ${({ theme }) => theme.bg1};
        box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
        padding: 0px;
        width: 50vw;
        overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};
        overflow-x: hidden;

        align-self: ${({ mobile }) => (mobile ? 'flex-end' : 'center')};

        max-width: ${({maxWidth}) => maxWidth ? `${maxWidth}px` : '475px'};
        ${({ maxHeight }) =>
            maxHeight &&
            css`
                max-height: ${maxHeight}vh;
            `}
        ${({ minHeight }) =>
            minHeight &&
            css`
                min-height: ${minHeight}vh;
            `}
    display: flex;
        border-radius: 10px;
        ${({ theme }) => theme.mediaWidth.upToMedium`
      width: 65vw;
      margin: 0;
    `}
        ${({ theme, mobile }) => theme.mediaWidth.upToSmall`
      width:  85vw;
      ${mobile &&
          css`
              width: 95vw;
              border-radius: 10px;
              border-bottom-left-radius: 0;
              border-bottom-right-radius: 0;
          `}
    `}
    }
`

interface ModalProps {
    isOpen: boolean
    onDismiss: () => void
    maxWidth?: number;
    minHeight?: number | false
    maxHeight?: number
    initialFocusRef?: React.RefObject<any>
    children?: React.ReactNode
    padding?: number
    noPadding?: boolean
    showClose?: boolean
}

export default function Modal({
    isOpen,
    onDismiss,
    minHeight = false,
    maxHeight = 90,
    maxWidth,
    initialFocusRef,
    children,
    padding = 5,
    noPadding = false,
    showClose
}: ModalProps) {
    const fadeTransition = useTransition(isOpen, null, {
        config: { duration: 200 },
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 }
    })

    const [{ y }, set] = useSpring(() => ({ y: 0, config: { mass: 1, tension: 210, friction: 20 } }))
    const bind = useGesture({
        onDrag: state => {
            set({
                y: state.down ? state.movement[1] : 0
            })
            if (state.movement[1] > 300 || (state.velocity > 3 && state.direction[1] > 0)) {
                onDismiss()
            }
        }
    })

    return (
        <>
            {fadeTransition.map(
                ({ item, key, props }) =>
                    item && (
                        <StyledDialogOverlay
                            key={key}
                            style={props}
                            onDismiss={onDismiss}
                            initialFocusRef={initialFocusRef}
                        >
                            <StyledDialogContent
                                {...(isMobile
                                    ? {
                                          ...bind(),
                                          style: {
                                              transform: y.interpolate(y => `translateY(${(y as number) > 0 ? y : 0}px)`)
                                          }
                                      }
                                    : {})}
                                aria-label="dialog content"
                                minHeight={minHeight}
                                maxHeight={maxHeight}
                                maxWidth={maxWidth}
                                mobile={isMobile}
                            >
                                <div className="from-blue to-pink w-full rounded p-px">
                                    <div
                                        className={`flex flex-col h-full w-full rounded overflow-y-auto ${
                                            noPadding ? 'p-0' : 'p-6 sm:p-3'
                                        }`}
                                    >
                                        {showClose && (
                                            <button className="modal-close" onClick={onDismiss}>
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 18 18"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M8.62728 10.9236L5.30765 14.2432L3.48842 12.424L6.80805 9.10434L3.31963 5.61592L5.21388 3.72167L8.7023 7.21009L12.0219 3.89046L13.8412 5.70969L10.5215 9.02932L14.01 12.5177L12.1157 14.412L8.62728 10.9236Z"
                                                        fill="currentColor"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                        {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
                                        {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
                                        {children}
                                    </div>
                                </div>
                            </StyledDialogContent>
                        </StyledDialogOverlay>
                    )
            )}
        </>
    )
}
