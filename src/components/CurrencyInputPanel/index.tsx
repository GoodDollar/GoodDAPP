import { Currency, Pair, ChainId } from '@sushiswap/sdk'
import { darken } from 'polished'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useTheme } from 'styled-components'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Input as NumericalInput } from '../NumericalInput'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import Button from '../Button'
import selectCoinAnimation from '../../assets/animation/select-coin.json'
import Lottie from 'lottie-react'
import { useUSDCPrice } from '../../hooks'
import { formattedNum } from '../../utils'
import { useLingui } from '@lingui/react'

const InputRow = styled.div<{ selected: boolean }>`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
    padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const CurrencySelect = styled.button<{ selected: boolean }>`
    align-items: center;
    height: 100%;
    font-size: 20px;
    font-weight: 500;
    // background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)};
    // color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    // border-radius: ${({ theme }) => theme.borderRadius};
    // box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
    outline: none;
    cursor: pointer;
    user-select: none;
    border: none;
    // padding: 0 0.5rem;

    :focus,
    :hover {
        // background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
    }
`

const LabelRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
    color: ${({ theme }) => theme.text1};
    font-size: 0.75rem;
    line-height: 1rem;
    padding: 0.75rem 1rem 0 1rem;
    span:hover {
        cursor: pointer;
        color: ${({ theme }) => darken(0.2, theme.text2)};
    }
`

const Aligner = styled.span`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

const StyledDropDown = styled(DropDown) <{ selected: boolean }>`
    margin: 0 0.25rem 0 0.5rem;
    height: 35%;

    path {
        stroke: ${({ theme }) => theme.color.switch};
        stroke-width: 1.5px;
    }
`

const StyledTokenName = styled.span<{ active?: boolean }>`
    //   ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
    //   font-size:  ${({ active }) => (active ? '24px' : '12px')};
`

const CurrencyPanelWrapper = styled.div`
    background: ${({ theme }) => theme.color.main};
    border: 1px solid ${({ theme }) => theme.color.border2};
    box-sizing: border-box;
    border-radius: 12px;

    .token-input-wrapper {
        background: ${({ theme }) => theme.color.main};
        border: 1px solid ${({ theme }) => theme.color.text2};
        box-sizing: border-box;
        border-radius: 6px;
        height: 60px;

        input {
            font-weight: normal;
            font-size: 24px;
            line-height: 28px;
            color: ${({ theme }) => theme.color.input};

            &::placeholder {
                color: ${({ theme }) => theme.color.input};
            }
        }
    }

    .max-btn {
        border: 1px solid ${({ theme }) => theme.color.text5};
        box-sizing: border-box;
        border-radius: 46px;
        font-weight: 900;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.3px;
        text-transform: uppercase;
        color: ${({ theme }) => theme.color.text5};
    }

    .balance {
        font-size: 12px;
        line-height: 14px;
        color: ${({ theme }) => theme.color.input};
    }

    .label {
        font-weight: 900;
        font-size: 16px;
        line-height: 24px;
        letter-spacing: 0.1px;
        color: ${({ theme }) => theme.color.text5};
    }

    .currency {
        font-style: normal;
        font-weight: bold;
        font-size: 24px;
        line-height: 32px;
        color: ${({ theme }) => theme.color.text6};
    }
`

interface CurrencyInputPanelProps {
    value: string
    onUserInput: (value: string) => void
    onMax?: () => void
    showMaxButton: boolean
    label?: string
    onCurrencySelect?: (currency: Currency) => void
    currency?: Currency | null
    disableCurrencySelect?: boolean
    hideBalance?: boolean
    pair?: Pair | null
    hideInput?: boolean
    otherCurrency?: Currency | null
    id: string
    showCommonBases?: boolean
    customBalanceText?: string
    cornerRadiusBottomNone?: boolean
    cornerRadiusTopNone?: boolean
    containerBackground?: string
}

export default function CurrencyInputPanel({
    value,
    onUserInput,
    onMax,
    showMaxButton,
    label = 'Input',
    onCurrencySelect,
    currency,
    disableCurrencySelect = false,
    hideBalance = false,
    pair = null, // used for double token logo
    hideInput = false,
    otherCurrency,
    id,
    showCommonBases,
    customBalanceText,
    cornerRadiusBottomNone,
    cornerRadiusTopNone,
    containerBackground
}: CurrencyInputPanelProps) {
    const { i18n } = useLingui()
    const [modalOpen, setModalOpen] = useState(false)
    const { account, chainId } = useActiveWeb3React()
    const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
    const theme = useTheme()

    const handleDismissSearch = useCallback(() => {
        setModalOpen(false)
    }, [setModalOpen])

    const currencyUSDC = useUSDCPrice(currency ? currency : undefined)?.toFixed(18)
    const valueUSDC = formattedNum(Number(value) * Number(currencyUSDC))

    return (
        <CurrencyPanelWrapper id={id} className="rounded p-5">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row justify-between">
                <div className="w-full sm:w-2/5">
                    <CurrencySelect
                        selected={!!currency}
                        className="open-currency-select-button"
                        onClick={() => {
                            if (!disableCurrencySelect) {
                                setModalOpen(true)
                            }
                        }}
                    >
                        <div className="flex">
                            {pair ? (
                                <DoubleCurrencyLogo
                                    currency0={pair.token0}
                                    currency1={pair.token1}
                                    size={54}
                                    margin={true}
                                />
                            ) : currency ? (
                                <div className="flex">
                                    <CurrencyLogo currency={currency} size={'54px'} />
                                </div>
                            ) : (
                                // <div className="rounded" style={{ maxWidth: 54, maxHeight: 54 }}>
                                //     <div style={{ width: 54, height: 54 }}>
                                //         <Lottie animationData={selectCoinAnimation} autoplay loop />
                                //     </div>
                                // </div>
                                <svg
                                    width="54"
                                    height="54"
                                    viewBox="0 0 54 54"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect width="54" height="54" rx="27" fill="#00B0FF" />
                                </svg>
                            )}
                            {pair ? (
                                <StyledTokenName className="pair-name-container">
                                    {pair?.token0.symbol}:{pair?.token1.symbol}
                                </StyledTokenName>
                            ) : (
                                <div className="flex flex-1 flex-col items-start justify-center w-full left mx-3.5 overflow-x-hidden">
                                    {label && <div className="label whitespace-nowrap">{label}</div>}
                                    <div className="flex items-center">
                                        <div className="whitespace-nowrap currency">
                                            {(currency && currency.symbol && currency.symbol.length > 20
                                                ? currency.symbol.slice(0, 4) +
                                                '...' +
                                                currency.symbol.slice(
                                                    currency.symbol.length - 5,
                                                    currency.symbol.length
                                                )
                                                : currency?.getSymbol(chainId)) || <div>{i18n._(t`GOO`)}</div>}
                                        </div>
                                        {/* </StyledTokenName> */}
                                        {!disableCurrencySelect && currency && <StyledDropDown selected={!!currency} />}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CurrencySelect>
                </div>
                <div className="token-input-wrapper flex items-center rounded space-x-3 p-3 w-full sm:w-3/5">
                    {!hideInput && (
                        <>
                            {account && currency && showMaxButton && label !== 'To' && (
                                <Button onClick={onMax} size="small" className="max-btn rounded-full whitespace-nowrap">
                                    {i18n._(t`Max`)}
                                </Button>
                            )}
                            <NumericalInput
                                className="token-amount-input"
                                value={value}
                                onUserInput={val => {
                                    onUserInput(val)
                                }}
                                placeholder="0.00"
                            />
                            {account && (
                                <div className="flex flex-col balance">
                                    <div onClick={onMax} className=" cursor-pointer">
                                        {!hideBalance && !!currency && selectedCurrencyBalance
                                            ? (customBalanceText ?? 'Balance: ') +
                                            selectedCurrencyBalance?.toSignificant(6)
                                            : ' -'}
                                    </div>
                                    {chainId === ChainId.MAINNET && <div className=" xs ">≈ {valueUSDC} USDC</div>}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {!disableCurrencySelect && onCurrencySelect && (
                <CurrencySearchModal
                    isOpen={modalOpen}
                    onDismiss={handleDismissSearch}
                    onCurrencySelect={onCurrencySelect}
                    selectedCurrency={currency}
                    otherSelectedCurrency={otherCurrency}
                    showCommonBases={showCommonBases}
                />
            )}
        </CurrencyPanelWrapper>
    )
}
