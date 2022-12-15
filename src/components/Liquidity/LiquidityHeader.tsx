import React from 'react'
import { NavLink } from '../Link'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export default function LiquidityHeader({ input = undefined, output = undefined }: any): JSX.Element {
    const { i18n } = useLingui()

    return (
        <div className="grid grid-cols-2 rounded-md p-3px ark-800">
            <NavLink
                className="flex items-center justify-center px-4 py-3 md:px-10 rounded-md center    "
                activeClassName="  ark-900"
                to={`/add/${input && input.address ? input.address : 'ETH'}${
                    output && output.address ? `/${output.address}` : ''
                }`}
            >
                {i18n._(t`Add`)}
            </NavLink>
            <NavLink
                onClick={(event) => {
                    if (!output) event.preventDefault()
                }}
                className="flex items-center justify-center px-4 py-3 md:px-10 rounded-md center    "
                activeClassName="  ark-900"
                to={`/remove/${input && input.address ? input.address : 'ETH'}${
                    output && output.address ? `/${output.address}` : `${input.address ? '/ETH' : ''}`
                }`}
            >
                {i18n._(t`Remove`)}
            </NavLink>
        </div>
    )
}
