import React, { ChangeEvent, CSSProperties, memo, useCallback, useRef, useState } from 'react'
import { SwapTokensModalSC, SwapTokensModalSearch } from './styled'
import Modal from 'components/Modal'
import Title from 'components/gd/Title'
import SwapTokensModalTokenRow from './SwapTokensModalTokenRow'
import { Currency, Token } from '@sushiswap/sdk'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export interface SwapTokensModalProps {
    className?: string
    style?: CSSProperties
    open: boolean
    onClose: () => any
    token?: Currency
    onTokenChange?: (token: Currency) => any
    tokenList?: Currency[]
}

const searchIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
            fill="currentColor"
        />
    </svg>
)

const SwapTokensModal = memo(
    ({ className, style, onClose, open, token: currentToken, onTokenChange, tokenList = [] }: SwapTokensModalProps) => {
        const { i18n } = useLingui()
        const [search, setSearch] = useState('')
        const [_search, _setSearch] = useState('')
        const timer = useRef<any>()
        const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
            _setSearch(event.currentTarget.value)
            clearTimeout(timer.current)
            timer.current = setTimeout(setSearch, 500, event.currentTarget.value.toUpperCase())
        }, [])
        const handleClose = useCallback(() => {
            onClose()
            _setSearch('')
            setSearch('')
        }, [onClose])

        return (
            <Modal isOpen={open} showClose onDismiss={handleClose}>
                <SwapTokensModalSC className={className} style={style}>
                    <Title className="text-center">Select token</Title>
                    <SwapTokensModalSearch>
                        <input
                            type="text"
                            placeholder={i18n._(t`Search name or paste the address`)}
                            value={_search}
                            onChange={handleSearchChange}
                        />
                        {searchIcon}
                    </SwapTokensModalSearch>
                    <div className="list">
                        {tokenList
                            ?.filter(
                                (token) => !(token.name?.startsWith('Compound') && token.getSymbol()?.startsWith('c'))
                            )
                            .filter(
                                (token) =>
                                    token.getSymbol()?.toUpperCase().includes(search) ||
                                    token.getName()?.toUpperCase().includes(search)
                            )
                            .map((token) => (
                                <SwapTokensModalTokenRow
                                    active={currentToken === token}
                                    token={token}
                                    key={token instanceof Token ? token.address : token.name}
                                    onClick={() => {
                                        if (currentToken !== token && onTokenChange) {
                                            onTokenChange(token)
                                            handleClose()
                                        }
                                    }}
                                />
                            ))}
                    </div>
                </SwapTokensModalSC>
            </Modal>
        )
    }
)

export default SwapTokensModal
