import React, { ChangeEvent, memo, useCallback, useState } from 'react'
import { PercentInputControlsStyled } from 'components/Withdraw/PercentInputControls/styled'
import MaskedInput from 'react-text-mask'
import { createNumberMask } from 'text-mask-addons'
import { ButtonEmpty } from 'components/ButtonLegacy'
import cn from 'classnames'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export interface PercentInputControlsProps {
    value: string
    onPercentChange: (value: string) => void
    disabled?: boolean
    type?: string
}

export const restrictValue = (value: string | undefined) => {
    if (!value) return '0'
    const result = value.replace('%', '')
    if (!result) return '0'
    if (+result > 100) return '100'
    return result
}

const percentMask = createNumberMask({ prefix: '', suffix: '%', integerLimit: 3 })

//eslint-disable-next-line @typescript-eslint/no-unused-vars
const PercentInputControls = memo(({ value, onPercentChange, disabled, type, ...rest }: PercentInputControlsProps) => {
    const { i18n } = useLingui()
    const [percentValue, setPercentValue] = useState(value)
    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = restrictValue(e.target.value)
            onPercentChange(value)
            setPercentValue(value)
        },
        [onPercentChange]
    )

    const handleSetPercentValue = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            const value = restrictValue(e.currentTarget.dataset.value)
            setPercentValue(value)
            onPercentChange(value)
        },
        [onPercentChange]
    )

    return (
        <PercentInputControlsStyled>
            <div className="flex items-center justify-between">
                <label htmlFor="percent">
                    {type === 'savingsDeposit'
                        ? i18n._(t`How much rewards would you like to donate`)
                        : i18n._(t`How much would you like to withdraw?`)}
                </label>
                <MaskedInput
                    name="percent"
                    className="percent-input"
                    value={percentValue}
                    mask={percentMask}
                    onChange={handleChange}
                />
            </div>

            <input className="mt-4 mb-3" type="range" value={percentValue} min={0} max={100} onChange={handleChange} />

            <div className="flex justify-between gap-1">
                <ButtonEmpty
                    className={cn('percent-button', { active: percentValue === '25' })}
                    onClick={(e) => handleSetPercentValue(e)}
                    data-value={'25'}
                >
                    25%
                </ButtonEmpty>
                <ButtonEmpty
                    className={cn('percent-button', { active: percentValue === '50' })}
                    onClick={(e) => handleSetPercentValue(e)}
                    data-value={'50'}
                >
                    50%
                </ButtonEmpty>
                <ButtonEmpty
                    className={cn('percent-button', { active: percentValue === '75' })}
                    onClick={(e) => handleSetPercentValue(e)}
                    data-value={'75'}
                >
                    75%
                </ButtonEmpty>
                <ButtonEmpty
                    className={cn('percent-button', { active: percentValue === '100' })}
                    onClick={(e) => handleSetPercentValue(e)}
                    data-value={'100'}
                >
                    100%
                </ButtonEmpty>
            </div>
        </PercentInputControlsStyled>
    )
})

export default PercentInputControls
