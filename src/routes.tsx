import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Stakes from 'pages/gd/Stake'
import DatastudioDashboard from 'pages/gd/DatastudioDashboard'
import Swap from 'pages/gd/Swap'
import { RedirectHashRoutes, RedirectPathToSwapOnly } from 'pages/routes/redirects'
import Portfolio from 'pages/gd/Portfolio'
import MicroBridge from 'pages/gd/MicroBridge'
import Claim from 'pages/gd/Claim'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

function Routes(): JSX.Element {
    const { chainId } = useActiveWeb3React()

    return (
        <Switch>
            <Route exact strict path="/dashboard" component={DatastudioDashboard} />
            <Route exact strict path="/swap" component={Swap} key={chainId} />
            <Route exact strict path="/stakes" component={Stakes} />
            <Route exact strict path="/portfolio" component={Portfolio} />
            {process.env.REACT_APP_CELO_PHASE_2 && <Route exact strict path="/claim" component={Claim} />}
            {process.env.REACT_APP_CELO_PHASE_3 && <Route exact strict path="/microbridge" component={MicroBridge} />}
            <Route exact strict path="/" component={RedirectHashRoutes} />
            <Route component={RedirectPathToSwapOnly} />
        </Switch>
    )
}

export default Routes
