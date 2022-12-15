import { diffTokenLists, TokenList } from '@uniswap/token-lists'
import React, { useCallback, useMemo } from 'react'

import { useDispatch } from 'react-redux'
import { Text } from 'rebass'
import styled from 'styled-components'
import { AppDispatch } from '../../state'
import { useRemovePopup } from '../../state/application/hooks'
import { acceptListUpdate } from '../../state/lists/actions'
import { TYPE } from '../../theme'
import listVersionLabel from '../../utils/listVersionLabel'
import { ButtonSecondary } from '../ButtonLegacy'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export const ChangesList = styled.ul`
    max-height: 400px;
    overflow: auto;
`

export default function ListUpdatePopup({
    popKey,
    listUrl,
    oldList,
    newList,
    auto,
}: {
    popKey: string
    listUrl: string
    oldList: TokenList
    newList: TokenList
    auto: boolean
}) {
    const { i18n } = useLingui()
    const removePopup = useRemovePopup()
    const removeThisPopup = useCallback(() => removePopup(popKey), [popKey, removePopup])
    const dispatch = useDispatch<AppDispatch>()

    const handleAcceptUpdate = useCallback(() => {
        if (auto) return

        dispatch(acceptListUpdate(listUrl))
        removeThisPopup()
    }, [auto, dispatch, listUrl, removeThisPopup])

    const {
        added: tokensAdded,
        changed: tokensChanged,
        removed: tokensRemoved,
    } = useMemo(() => {
        return diffTokenLists(oldList.tokens, newList.tokens)
    }, [newList.tokens, oldList.tokens])
    const numTokensChanged = useMemo(
        () =>
            Object.keys(tokensChanged).reduce(
                (memo, chainId: any) => memo + Object.keys(tokensChanged[chainId]).length,
                0
            ),
        [tokensChanged]
    )

    return (
        <AutoRow>
            <AutoColumn style={{ flex: '1' }} gap="8px">
                {auto ? (
                    <TYPE.body fontWeight={500}>
                        {i18n._(t`The token list`)} &quot;{oldList.name}&quot; {i18n._(t`has been updated to`)}{' '}
                        <strong>{listVersionLabel(newList.version)}</strong>.
                    </TYPE.body>
                ) : (
                    <>
                        <div>
                            <Text>
                                {i18n._(t`An update is available for the token list`)} &quot;{oldList.name}&quot; (
                                {listVersionLabel(oldList.version)} {i18n._(t`to`)} {listVersionLabel(newList.version)}
                                ).
                            </Text>
                            <ChangesList>
                                {tokensAdded.length > 0 ? (
                                    <li>
                                        {tokensAdded.map((token, i) => (
                                            <React.Fragment key={`${token.chainId}-${token.address}`}>
                                                <strong title={token.address}>{token.symbol}</strong>
                                                {i === tokensAdded.length - 1 ? null : ', '}
                                            </React.Fragment>
                                        ))}{' '}
                                        {i18n._(t`added`)}
                                    </li>
                                ) : null}
                                {tokensRemoved.length > 0 ? (
                                    <li>
                                        {tokensRemoved.map((token, i) => (
                                            <React.Fragment key={`${token.chainId}-${token.address}`}>
                                                <strong title={token.address}>{token.symbol}</strong>
                                                {i === tokensRemoved.length - 1 ? null : ', '}
                                            </React.Fragment>
                                        ))}{' '}
                                        {i18n._(t`removed`)}
                                    </li>
                                ) : null}
                                {numTokensChanged > 0 ? (
                                    <li>
                                        {numTokensChanged} {i18n._(t`tokens updated`)}
                                    </li>
                                ) : null}
                            </ChangesList>
                        </div>
                        <AutoRow>
                            <div style={{ flexGrow: 1, marginRight: 12 }}>
                                <ButtonSecondary onClick={handleAcceptUpdate}>
                                    {i18n._(t`Accept update`)}
                                </ButtonSecondary>
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <ButtonSecondary onClick={removeThisPopup}>{i18n._(t`Dismiss`)}</ButtonSecondary>
                            </div>
                        </AutoRow>
                    </>
                )}
            </AutoColumn>
        </AutoRow>
    )
}
