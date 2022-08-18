import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { AppDispatch } from '../../state'
import { setOpenModal } from '../../state/application/actions'
import { ApplicationModal } from '../../state/application/types'

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

