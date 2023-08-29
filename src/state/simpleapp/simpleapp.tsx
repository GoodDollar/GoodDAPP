import React, { ReactNode, createContext, useContext, useEffect } from 'react'

export interface ISimpleApp {
    isSimpleApp: boolean
    children?: ReactNode
}

export const SimpleAppContext = createContext<ISimpleApp>({ isSimpleApp: false })

export function useIsSimpleApp() {
    const { isSimpleApp } = useContext(SimpleAppContext)
    return isSimpleApp
}

export const SimpleAppProvider = ({ children }) => {
    const params = new URLSearchParams(window.location.search)
    const isSimpleApp = (params.get('simpleapp') || localStorage.getItem('GD_SIMPLEAPP')) === 'true'
    useEffect(() => {
        const isSimpleApp = params.get('simpleapp')
        if (!isSimpleApp) {
            return
        }
        localStorage.setItem('GD_SIMPLEAPP', isSimpleApp)
    }, [params])

    return <SimpleAppContext.Provider value={{ isSimpleApp }}>{children} </SimpleAppContext.Provider>
}
