import React, { CSSProperties, memo } from 'react'
import { SwapTokensModalRow, SwapTokensModalSC, SwapTokensModalSearch } from './styled'
import Modal from '../../../components/Modal'
import Title from '../../../components/gd/Title'

export interface SwapTokensModalProps {
    className?: string
    style?: CSSProperties
    open: boolean
    onClose: () => any
}

const searchIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
            fill="currentColor"
        />
    </svg>
)

function SwapTokensModal({ className, style, onClose, open }: SwapTokensModalProps) {
    return (
        <Modal isOpen={open} showClose onDismiss={onClose}>
            <SwapTokensModalSC className={className} style={style}>
                <Title className="text-center">Select token</Title>
                <SwapTokensModalSearch>
                    <input type="text" placeholder="Search name or paste the address" />
                    {searchIcon}
                </SwapTokensModalSearch>
                <div className="list">
                    <SwapTokensModalRow onClick={onClose}>
                        <div className="icon">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 32 32"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                xlinkHref="http://www.w3.org/1999/xlink"
                            >
                                <rect width="32" height="32" rx="3" fill="url(#pattern0)" />
                                <defs>
                                    <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                                        <use xlinkHref="#image0" transform="scale(0.03125)" />
                                    </pattern>
                                    <image
                                        id="image0"
                                        width="32"
                                        height="32"
                                        xlinkHref="data:image/png;base64,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"
                                    />
                                </defs>
                            </svg>
                        </div>
                        <div className="title">BAKE</div>
                        <div className="subtitle">Bakery token</div>
                        <div className="balance">0.034567891023</div>
                    </SwapTokensModalRow>
                </div>
            </SwapTokensModalSC>
        </Modal>
    )
}

export default memo(SwapTokensModal)
