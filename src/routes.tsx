import React from 'react'
import { Route, Switch } from 'react-router-dom'
import LendMarkets from './kashi/pages/Markets/Lending'
import Swap from './pages/Swap'
import SwapDeprecated from './pages/SwapDeprecated'
import { RedirectHashRoutes, RedirectPathToSwapOnly, RedirectToSwap } from './pages/SwapDeprecated/redirects'
import Portfolio from './pages/Portfolio'

function Routes(): JSX.Element {
    return (
        <Switch>
            <Route exact strict path="/stakes" component={LendMarkets} />
            <Route exact strict path="/portfolio" component={Portfolio} />
            <Route exact strict path="/swap" component={Swap} />
            <Route exact strict path="/swap_deprecated" component={SwapDeprecated} />
            <Route exact strict path="/swap_deprecated/:outputCurrency" component={RedirectToSwap} />
            <Route exact strict path="/" component={RedirectHashRoutes} />
            <Route component={RedirectPathToSwapOnly} />
        </Switch>
    )
}

export default Routes
