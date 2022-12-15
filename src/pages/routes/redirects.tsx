import React from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'

// Redirects Legacy Hash Routes to Browser Routes
export function RedirectHashRoutes({ location }: RouteComponentProps) {
    //console.log('location:', location.hash)
    if (!location.hash) {
        return <Redirect to={{ ...location, pathname: '/swap' }} />
    }
    return <Redirect to={location.hash.replace('#', '')} />
}

// Redirects to swap but only replace the pathname
export function RedirectPathToSwapOnly({ location }: RouteComponentProps) {
    return <Redirect to={{ ...location, pathname: '/swap' }} />
}
