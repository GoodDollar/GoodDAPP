import React from 'react'
import Badge from '../../components/Badge'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const Menu = ({ section, setSection }: any) => {
    const { i18n } = useLingui()

    return (
        <div className="overflow-x-auto">
            <div className="flex flex-row space-x-2 xs whitespace-nowrap  lg:flex-col lg:space-y-2 lg:space-x-0">
                <div
                    className={`cursor-pointer rounded flex items-center px-4 py-6 ${section === 'portfolio' && ''}`}
                    onClick={() => {
                        return setSection('portfolio')
                    }}
                >
                    {i18n._(t`Your Staked Farms`)}
                </div>
                <div
                    className={`cursor-pointer rounded flex items-center px-4 py-6 ${section === 'all' && ''}`}
                    onClick={() => {
                        return setSection('all')
                    }}
                >
                    {i18n._(t`All Yield Farms`)}
                </div>
                <div
                    className={`cursor-pointer rounded flex items-center px-4 py-6 ${section === 'kmp' && ''}`}
                    onClick={() => {
                        return setSection('kmp')
                    }}
                >
                    {i18n._(t`Lending Yield Farms`)}
                </div>
                <div
                    className={`cursor-pointer rounded flex items-center px-4 py-6 ${section === 'slp' && ''}`}
                    onClick={() => {
                        return setSection('slp')
                    }}
                >
                    {i18n._(t`Liquidity Yield Farms`)}
                </div>
                <div
                    className={`cursor-pointer rounded flex justify-between items-center px-4 py-6 ${section ===
                        'mcv2' && ''}`}
                    onClick={() => {
                        return setSection('mcv2')
                    }}
                >
                    {i18n._(t`Double Yield Farms`)}
                    <Badge color="blue">{i18n._(t`New`)}</Badge>
                </div>
                {/* <Card
                className="h-full bg-dark-900"
                backgroundImage={DepositGraphic}
                title={'Create a new Kashi Market'}
                description={
                    'If you want to supply to a market that is not listed yet, you can use this tool to create a new pair.'
                }
            /> */}
            </div>
        </div>
    )
}

export default Menu
