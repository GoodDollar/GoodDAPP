import React from 'react'
import { Route, Switch } from 'react-router-dom'
import LendMarkets from './pages/Stake'
import Swap from './pages/Swap'
import SwapDeprecated from './pages/SwapDeprecated'
import { RedirectHashRoutes, RedirectPathToSwapOnly, RedirectToSwap } from './pages/SwapDeprecated/redirects'
import Portfolio from './pages/Portfolio'
import useActiveWeb3React from './hooks/useActiveWeb3React'

function Routes(): JSX.Element {
    const { account, chainId } = useActiveWeb3React()

    return (
        <Switch>
            <Route exact strict path="/stakes" component={LendMarkets} />
            <Route exact strict path="/swap" component={Swap} key={chainId} />
            {account && <Route exact strict path="/portfolio" component={Portfolio} />}
            <Route exact strict path="/" component={RedirectHashRoutes} />
            <Route component={RedirectPathToSwapOnly} />
        </Switch>
    )
}

export default Routes
