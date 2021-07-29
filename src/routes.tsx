import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Stakes from './pages/Stake'
import Swap from './pages/Swap'
import { RedirectHashRoutes, RedirectPathToSwapOnly } from './pages/SwapDeprecated/redirects'
import Portfolio from './pages/Portfolio'
import useActiveWeb3React from './hooks/useActiveWeb3React'
import { useWeb3React } from '@web3-react/core'
import { portfolioSupportedAt, stakesSupportedAt } from './sdk/constants/chains'

function Routes(): JSX.Element {
    const { chainId } = useWeb3React()
    const { account } = useActiveWeb3React()

    return (
        <Switch>
            <Route exact strict path="/swap" component={Swap} key={chainId} />
            {chainId && stakesSupportedAt.includes(chainId) && <Route exact strict path="/stakes" component={Stakes} />}
            {chainId && account && portfolioSupportedAt.includes(chainId) && (
                <Route exact strict path="/portfolio" component={Portfolio} />
            )}
            <Route exact strict path="/" component={RedirectHashRoutes} />
            <Route component={RedirectPathToSwapOnly} />
        </Switch>
    )
}

export default Routes
