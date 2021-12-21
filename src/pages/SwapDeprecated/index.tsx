import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import { AutoRow, RowBetween } from '../../components/Row'
import { ButtonConfirmed } from '../../components/ButtonLegacy'
import Card from '../../components/CardLegacy'
import { ChainId, CurrencyAmount, JSBI, Token, Trade } from '@sushiswap/sdk'
import Column, { AutoColumn } from '../../components/Column'
import { LinkStyledButton } from '../../theme'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import {
    useDefaultsFromURLSearch,
    useDerivedSwapInfo,
    useSwapActionHandlers,
    useSwapState
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSingleHopOnly, useUserSlippageTolerance } from '../../state/user/hooks'
import { useNetworkModalToggle, useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'

import AddressInputPanel from '../../components/AddressInputPanel'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import { ArrowDown } from 'react-feather'
import { ClickableText } from '../Pool/styleds'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { Field } from '../../state/swap/actions'
import { Helmet } from 'react-helmet'
import { INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
import Loader from '../../components/Loader'
import Lottie from 'lottie-react'

import SwapHeader from '../../components/ExchangeHeader'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { Text } from 'rebass'
import { useTheme } from 'styled-components'
import TokenWarningModal from '../../components/TokenWarningModal'
import TradePrice from '../../components/swap/TradePrice'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import swapArrowsAnimationData from '../../assets/animation/swap-arrows.json'
import { t, Trans } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import useENSAddress from '../../hooks/useENSAddress'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import { useLingui } from '@lingui/react'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import { SwapWrapper } from './styled'
import { ButtonAction } from '../../components/gd/Button'

export default function Swap() {
    const { i18n } = useLingui()
    const toggleNetworkModal = useNetworkModalToggle()

    const loadedUrlParams = useDefaultsFromURLSearch()

    // token warning stuff
    const [loadedInputCurrency, loadedOutputCurrency] = [
        useCurrency(loadedUrlParams?.inputCurrencyId),
        useCurrency(loadedUrlParams?.outputCurrencyId)
    ]
    const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
    const urlLoadedTokens: Token[] = useMemo(
        () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
        [loadedInputCurrency, loadedOutputCurrency]
    )
    const handleConfirmTokenWarning = useCallback(() => {
        setDismissTokenWarning(true)
    }, [])

    // dismiss warning if all imported tokens are in active lists
    const defaultTokens = useAllTokens()
    const importTokensNotInDefault =
        urlLoadedTokens &&
        urlLoadedTokens.filter((token: Token) => {
            return !Boolean(token.address in defaultTokens)
        })

    const { account, chainId } = useActiveWeb3React()
    const theme = useTheme()

    // toggle wallet when disconnected
    const toggleWalletModal = useWalletModalToggle()

    // for expert mode
    const toggleSettings = useToggleSettingsMenu()
    const [isExpertMode] = useExpertModeManager()

    // get custom setting values for user
    const [allowedSlippage] = useUserSlippageTolerance()

    // swap state
    const { independentField, typedValue, recipient } = useSwapState()
    const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
    const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
        currencies[Field.INPUT],
        currencies[Field.OUTPUT],
        typedValue
    )
    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
    const { address: recipientAddress } = useENSAddress(recipient)

    const trade = showWrap ? undefined : v2Trade

    const parsedAmounts = showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount
        }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
        }

    const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
    const isValid = !swapInputError
    const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

    const handleTypeInput = useCallback(
        (value: string) => {
            onUserInput(Field.INPUT, value)
        },
        [onUserInput]
    )
    const handleTypeOutput = useCallback(
        (value: string) => {
            onUserInput(Field.OUTPUT, value)
        },
        [onUserInput]
    )

    // modal and loading
    const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
        showConfirm: boolean
        tradeToConfirm: Trade | undefined
        attemptingTxn: boolean
        swapErrorMessage: string | undefined
        txHash: string | undefined
    }>({
        showConfirm: false,
        tradeToConfirm: undefined,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        txHash: undefined
    })

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: showWrap
            ? parsedAmounts[independentField]?.toExact() ?? ''
            : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
    }

    const route = trade?.route
    const userHasSpecifiedInputOutput = Boolean(
        currencies[Field.INPUT] &&
        currencies[Field.OUTPUT] &&
        parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
    )
    const noRoute = !route

    // check whether the user has approved the router on the input token
    const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

    // check if user has gone through approval process, used to show two step buttons, reset on token change
    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

    // mark when a user has submitted an approval, reset onTokenSelection for input field
    useEffect(() => {
        if (approval === ApprovalState.PENDING) {
            setApprovalSubmitted(true)
        }
    }, [approval, approvalSubmitted])

    const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
    const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

    // the callback to execute the swap
    const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

    const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

    const [singleHopOnly] = useUserSingleHopOnly()

    const handleSwap = useCallback(() => {
        if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
            return
        }
        if (!swapCallback) {
            return
        }
        setSwapState({
            attemptingTxn: true,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: undefined,
            txHash: undefined
        })
        swapCallback()
            .then(hash => {
                setSwapState({
                    attemptingTxn: false,
                    tradeToConfirm,
                    showConfirm,
                    swapErrorMessage: undefined,
                    txHash: hash
                })
            })
            .catch(error => {
                setSwapState({
                    attemptingTxn: false,
                    tradeToConfirm,
                    showConfirm,
                    swapErrorMessage: error.message,
                    txHash: undefined
                })
            })
    }, [
        priceImpactWithoutFee,
        swapCallback,
        tradeToConfirm,
        showConfirm,
        recipient,
        recipientAddress,
        account,
        trade,
        chainId,
        singleHopOnly
    ])

    // errors
    const [showInverted, setShowInverted] = useState<boolean>(false)

    // warnings on slippage
    const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

    // show approve flow when: no error on inputs, not approved or pending, or approved in current session
    // never show if price impact is above threshold in non expert mode
    const showApproveFlow =
        !swapInputError &&
        (approval === ApprovalState.NOT_APPROVED ||
            approval === ApprovalState.PENDING ||
            (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
        !(priceImpactSeverity > 3 && !isExpertMode)

    const handleConfirmDismiss = useCallback(() => {
        setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onUserInput(Field.INPUT, '')
        }
    }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

    const handleAcceptChanges = useCallback(() => {
        setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
    }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

    const handleInputSelect = useCallback(
        inputCurrency => {
            setApprovalSubmitted(false) // reset 2 step UI for approvals
            onCurrencySelection(Field.INPUT, inputCurrency)
        },
        [onCurrencySelection]
    )

    const handleMaxInput = useCallback(() => {
        maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
    }, [maxAmountInput, onUserInput])

    const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
        onCurrencySelection
    ])

    const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

    const [animateSwapArrows, setAnimateSwapArrows] = useState<boolean>(false)

    return (
        <>
            <Helmet>
                <title>{i18n._(t`Swap`)} | Sushi</title>
                <meta
                    name="description"
                    content={i18n._(t`Sushi allows for swapping of ERC20 compatible tokens across multiple networks`)}
                />
            </Helmet>
            <TokenWarningModal
                isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
                tokens={importTokensNotInDefault}
                onConfirm={handleConfirmTokenWarning}
            />
            <SwapPoolTabs active={'swap'} />
            <SwapWrapper className="w-full rounded-md">
                <SwapHeader input={currencies[Field.INPUT]} output={currencies[Field.OUTPUT]} />
                <Wrapper id="swap-page">
                    <ConfirmSwapModal
                        isOpen={showConfirm}
                        trade={trade}
                        originalTrade={tradeToConfirm}
                        onAcceptChanges={handleAcceptChanges}
                        attemptingTxn={attemptingTxn}
                        txHash={txHash}
                        recipient={recipient}
                        allowedSlippage={allowedSlippage}
                        onConfirm={handleSwap}
                        swapErrorMessage={swapErrorMessage}
                        onDismiss={handleConfirmDismiss}
                    />
                    <AutoColumn gap={'md'}>
                        <CurrencyInputPanel
                            label={
                                independentField === Field.OUTPUT && !showWrap && trade
                                    ? i18n._(t`Swap from`)
                                    : i18n._(t`Swap from`)
                            }
                            value={formattedAmounts[Field.INPUT]}
                            showMaxButton={!atMaxAmountInput}
                            currency={currencies[Field.INPUT]}
                            onUserInput={handleTypeInput}
                            onMax={handleMaxInput}
                            onCurrencySelect={handleInputSelect}
                            otherCurrency={currencies[Field.OUTPUT]}
                            id="swap-currency-input"
                        />
                        <AutoColumn justify="space-between">
                            <AutoRow
                                justify={isExpertMode ? 'space-between' : 'flex-start'}
                                style={{ padding: '0 1.25rem' }}
                            >
                                <button
                                    className="rounded-full p-3px -mt-6 -mb-6 z-10"
                                    onClick={() => {
                                        setApprovalSubmitted(false) // reset 2 step UI for approvals
                                        onSwitchTokens()
                                    }}
                                    style={{
                                        background: theme.color.switch,
                                        border: `2px solid ${theme.color.main}`
                                    }}
                                >
                                    <div
                                        className="rounded-full"
                                        style={{ padding: 6 }}
                                        onMouseEnter={() => setAnimateSwapArrows(true)}
                                        onMouseLeave={() => setAnimateSwapArrows(false)}
                                    >
                                        <Lottie
                                            animationData={swapArrowsAnimationData}
                                            autoplay={animateSwapArrows}
                                            loop={false}
                                            style={{ width: 32, height: 32 }}
                                        />
                                    </div>
                                </button>
                                {recipient === null && !showWrap && isExpertMode ? (
                                    <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                                        {i18n._(t`+ Add a send (optional)`)}
                                    </LinkStyledButton>
                                ) : null}
                            </AutoRow>
                        </AutoColumn>

                        <CurrencyInputPanel
                            value={formattedAmounts[Field.OUTPUT]}
                            onUserInput={handleTypeOutput}
                            label={
                                independentField === Field.INPUT && !showWrap && trade
                                    ? i18n._(t`Swap to`)
                                    : i18n._(t`Swap to`)
                            }
                            showMaxButton={false}
                            currency={currencies[Field.OUTPUT]}
                            onCurrencySelect={handleOutputSelect}
                            otherCurrency={currencies[Field.INPUT]}
                            id="swap-currency-output"
                        />

                        {recipient !== null && !showWrap ? (
                            <>
                                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                                    <ArrowWrapper clickable={false}>
                                        <ArrowDown size="16" color={theme.text2} />
                                    </ArrowWrapper>
                                    <LinkStyledButton
                                        id="remove-recipient-button"
                                        onClick={() => onChangeRecipient(null)}
                                    >
                                        - {i18n._(t`Remove send`)}
                                    </LinkStyledButton>
                                </AutoRow>
                                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                            </>
                        ) : null}

                        {showWrap ? null : (
                            <Card
                                className="initial-info"
                                padding={showWrap ? '.25rem 1rem 0 1rem' : '0px'}
                                borderRadius={'20px'}
                            >
                                <AutoColumn gap="8px" style={{ padding: '0 16px' }}>
                                    {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                                        <RowBetween align="center">
                                            <ClickableText onClick={toggleSettings}>
                                                {i18n._(t`Slippage Tolerance`)}
                                            </ClickableText>
                                            <ClickableText onClick={toggleSettings}>
                                                {allowedSlippage / 100}%
                                            </ClickableText>
                                        </RowBetween>
                                    )}
                                    {Boolean(trade) && (
                                        <RowBetween align="center">
                                            <Text>{i18n._(t`Price`)}</Text>
                                            <TradePrice
                                                price={trade?.executionPrice}
                                                showInverted={showInverted}
                                                setShowInverted={setShowInverted}
                                            />
                                        </RowBetween>
                                    )}
                                </AutoColumn>
                            </Card>
                        )}
                    </AutoColumn>
                    <BottomGrouping>
                        {swapIsUnsupported ? (
                            <ButtonAction>{i18n._(t`Unsupported Asset`)}</ButtonAction>
                        ) : !account ? (
                            <ButtonAction onClick={toggleWalletModal}>{i18n._(t`Connect Wallet`)}</ButtonAction>
                        ) : showWrap ? (
                            <ButtonAction disabled={Boolean(wrapInputError)} onClick={onWrap}>
                                {wrapInputError ??
                                    (wrapType === WrapType.WRAP
                                        ? i18n._(t`Wrap`)
                                        : wrapType === WrapType.UNWRAP
                                            ? i18n._(t`Unwrap`)
                                            : null)}
                            </ButtonAction>
                        ) : noRoute && userHasSpecifiedInputOutput ? (
                            <ButtonAction disabled>
                                {i18n._(t`Insufficient liquidity for this trade`)}
                                {/*{singleHopOnly && (
                                    <TYPE.main mb="4px">{i18n._(t`Try enabling multi-hop trades`)}</TYPE.main>
                                )}*/}
                            </ButtonAction>
                        ) : showApproveFlow ? (
                            <RowBetween>
                                <ButtonConfirmed
                                    onClick={approveCallback}
                                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                                    width="48%"
                                    altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                                    confirmed={approval === ApprovalState.APPROVED}
                                >
                                    {approval === ApprovalState.PENDING ? (
                                        <AutoRow gap="6px" justify="center">
                                            {i18n._(t`APPROVING`)} <Loader stroke="white" />
                                        </AutoRow>
                                    ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                                        i18n._(t`APPROVED`)
                                    ) : (
                                        i18n._(t`APPROVE`)
                                    )}
                                </ButtonConfirmed>
                                <ButtonAction
                                    onClick={() => {
                                        if (isExpertMode) {
                                            handleSwap()
                                        } else {
                                            setSwapState({
                                                tradeToConfirm: trade,
                                                attemptingTxn: false,
                                                swapErrorMessage: undefined,
                                                showConfirm: true,
                                                txHash: undefined
                                            })
                                        }
                                    }}
                                    width="48%"
                                    id="swap-button"
                                    disabled={
                                        !isValid ||
                                        approval !== ApprovalState.APPROVED ||
                                        (priceImpactSeverity > 3 && !isExpertMode)
                                    }
                                    error={isValid && priceImpactSeverity > 2}
                                >
                                    {priceImpactSeverity > 3 && !isExpertMode
                                        ? i18n._(t`Price Impact High`)
                                        : priceImpactSeverity > 2
                                            ? i18n._(t`Swap Anyway`)
                                            : i18n._(t`SWAP`)}
                                </ButtonAction>
                            </RowBetween>
                        ) : (
                            <ButtonAction
                                onClick={() => {
                                    if (isExpertMode) {
                                        handleSwap()
                                    } else {
                                        setSwapState({
                                            tradeToConfirm: trade,
                                            attemptingTxn: false,
                                            swapErrorMessage: undefined,
                                            showConfirm: true,
                                            txHash: undefined
                                        })
                                    }
                                }}
                                id="swap-button"
                                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                            // error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                            >
                                <Text fontSize={20} fontWeight={500}>
                                    {swapInputError
                                        ? swapInputError
                                        : priceImpactSeverity > 3 && !isExpertMode
                                            ? i18n._(t`Price Impact Too High`)
                                            : priceImpactSeverity > 2
                                                ? i18n._(t`Swap Anyway`)
                                                : i18n._(t`Swap`)}
                                </Text>
                            </ButtonAction>
                        )}
                        {/*{showApproveFlow && (
                            <Column style={{ marginTop: '1rem' }}>
                                <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                            </Column>
                        )}*/}
                        {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                    </BottomGrouping>
                </Wrapper>
            </SwapWrapper>
            {!swapIsUnsupported && <AdvancedSwapDetailsDropdown trade={trade} />}
            {/*{!swapIsUnsupported ? (
                <AdvancedSwapDetailsDropdown trade={trade} />
            ) : (
                <UnsupportedCurrencyFooter
                    show={swapIsUnsupported}
                    currencies={[currencies.INPUT, currencies.OUTPUT]}
                />
            )}*/}
        </>
    )
}
