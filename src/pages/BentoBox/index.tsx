import BentoBoxHero from '../../assets/kashi/bentobox-hero.jpg'
import BentoBoxLogo from '../../assets/kashi/bentobox-logo.svg'
import { Card } from 'kashi/components'
import ComingSoon from '../../assets/kashi/coming-soon.png'
import { Helmet } from 'react-helmet'
import KashiNeonSign from '../../assets/kashi/kashi-neon.png'
import { Link } from 'react-router-dom'
import React from 'react'
import Web3Status from 'components/Web3Status'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'

function BentoBox(): JSX.Element {
    const { i18n } = useLingui()

    const { account } = useActiveWeb3React()

    return (
        <>
            {' '}
            <Helmet>
                <title>BentoBox | Sushi</title>
            </Helmet>
            <div>
                <div
                    className="absolute top-0 right-0 left-0"
                    style={{
                        height: '700px',
                        zIndex: -1
                    }}
                >
                    <img
                        className="h-full w-full object-cover object-bottom opacity-50 -mt-32"
                        src={BentoBoxHero}
                        alt=""
                    />
                </div>

                <div className="relative flex flex-col items-center">
                    <img alt="" src={BentoBoxLogo} className="object-scale-down w-40 md:w-60 h-auto" />

                    <div className="container mx-auto max-w-3xl">
                        <div className=" center 3xl 5xl ">{i18n._(t`BentoBox Apps`)}</div>
                        <div className="  lg  center  mt-0 md:mt-4 mb-8 p-4">
                            {i18n._(
                                t`BentoBox is an innovative way to use dapps gas-efficiently and gain extra yield.`
                            )}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto sm:px-6 max-w-5xl">
                    <div className="grid gap-4 sm:gap-12 grid-flow-auto grid-cols-4">
                        <Card className="col-span-2 md:col-span-1 w-full cursor-pointer rounded">
                            <div className="relative w-full">
                                <img alt="" src={KashiNeonSign} className="block m-auto w-full h-auto mb-4" />
                                {account ? (
                                    <Link to={'/bento/kashi/borrow'}>
                                        <div
                                            className="w-full py-2 center"
                                            // className="w-full rounded text-lg text-high-emphesis px-4 py-2"
                                        >
                                            {i18n._(t`Enter`)}
                                        </div>
                                    </Link>
                                ) : (
                                    <Web3Status />
                                )}
                            </div>
                        </Card>
                        <Card className="flex items-center justify-center col-span-2 md:col-span-1  cursor-pointer transition-colors">
                            <img src={ComingSoon} alt="Coming Soon" className="block m-auto w-full h-auto" />
                        </Card>
                        <Card className="flex items-center justify-center col-span-2 md:col-span-1 cursor-pointer transition-colors">
                            <img src={ComingSoon} alt="Coming Soon" className="block m-auto w-full h-auto" />
                        </Card>
                        <Card className="flex items-center justify-center col-span-2 md:col-span-1 cursor-pointer transition-colors">
                            <img src={ComingSoon} alt="Coming Soon" className="block m-auto w-full h-auto" />
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BentoBox
