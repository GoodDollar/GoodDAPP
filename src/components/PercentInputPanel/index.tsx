import React from 'react'
import { Input as PercentInput } from '../PercentInput'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

interface PercentInputPanelProps {
    value: string
    onUserInput: (value: string) => void
    id: string
}

export default function PercentInputPanel({ value, onUserInput, id }: PercentInputPanelProps) {
    const { i18n } = useLingui()

    return (
        <div id={id} className="rounded p-5">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row justify-between">
                <div className="w-full sm:w-2/5 white" style={{ margin: 'auto 0px' }}>
                    {i18n._(t`Amount to Remove`)}
                </div>
                <div className="flex items-center rounded   space-x-3 p-3 w-full sm:w-3/5">
                    <PercentInput
                        className="token-amount-input"
                        value={value}
                        onUserInput={val => {
                            onUserInput(val)
                        }}
                        align="right"
                    />
                    <div className="  pl-2">%</div>
                </div>
            </div>
        </div>
    )
}
