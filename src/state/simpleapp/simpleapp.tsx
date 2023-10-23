import React, { createContext, FC, ReactNode, useContext, useState } from 'react'

export interface ISimpleApp {
    isSimpleApp: boolean
}

export const SimpleAppContext = createContext<ISimpleApp>({ isSimpleApp: false })

export function useIsSimpleApp() {
    const { isSimpleApp } = useContext(SimpleAppContext)

    return isSimpleApp
}

export const SimpleAppProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [isSimpleApp] = useState<boolean>(() => {
        const params = new URLSearchParams(window.location.search)

        return !!params.get('simpleapp')
    })

    return <SimpleAppContext.Provider value={{ isSimpleApp }}>{children}</SimpleAppContext.Provider>
}
