import { parseUnits } from '@ethersproject/units'
import { Currency, CurrencyAmount, ETHER, JSBI, Token, TokenAmount, Trade } from '@sushiswap/sdk'
import { ParsedQs } from 'qs'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress } from '../../utils'
import { AppDispatch } from '../index'
import { Field, replaceSwapState } from './actions'
import { SwapState } from './reducer'

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
    if (!value || !currency) {
        return undefined
    }
    try {
        const typedValueParsed = parseUnits(value, currency.decimals).toString()
        if (typedValueParsed !== '0') {
            return currency instanceof Token
                ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
                : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
        }
    } catch (error) {
        // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
        console.debug(`Failed to parse input amount: "${value}"`, error)
    }
    // necessary for all paths to return a value
    return undefined
}

function parseCurrencyFromURLParameter(urlParam: any): string {
    if (typeof urlParam === 'string') {
        const valid = isAddress(urlParam)
        if (valid) return valid
        if (urlParam.toUpperCase() === 'ETH') return 'ETH'
        if (valid === false) return 'ETH'
    }
    return 'ETH' ?? ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
    return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
    return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
    if (typeof recipient !== 'string') return null
    const address = isAddress(recipient)
    if (address) return address
    if (ENS_NAME_REGEX.test(recipient)) return recipient
    if (ADDRESS_REGEX.test(recipient)) return recipient
    return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
    let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
    let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
    if (inputCurrency === outputCurrency) {
        if (typeof parsedQs.outputCurrency === 'string') {
            inputCurrency = ''
        } else {
            outputCurrency = ''
        }
    }

    const recipient = validatedRecipient(parsedQs.recipient)

    return {
        [Field.INPUT]: {
            currencyId: inputCurrency,
        },
        [Field.OUTPUT]: {
            currencyId: outputCurrency,
        },
        typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
        independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
        recipient,
    }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
    | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
    | undefined {
    const { chainId } = useActiveWeb3React()
    const dispatch = useDispatch<AppDispatch>()
    const parsedQs = useParsedQueryString()
    const [result, setResult] = useState<
        { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
    >()

    useEffect(() => {
        if (!chainId) return
        const parsed = queryParametersToSwapState(parsedQs)

        dispatch(
            replaceSwapState({
                typedValue: parsed.typedValue,
                field: parsed.independentField,
                inputCurrencyId: parsed[Field.INPUT].currencyId,
                outputCurrencyId: parsed[Field.OUTPUT].currencyId,
                recipient: parsed.recipient,
            })
        )

        setResult({
            inputCurrencyId: parsed[Field.INPUT].currencyId,
            outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, chainId])

    return result
}
