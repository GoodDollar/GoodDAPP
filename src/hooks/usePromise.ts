import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

const initialState = {
    loading: true,
    error: undefined,
    value: undefined
}

export default function usePromise<T>(getPromise: () => Promise<T>, deps: any[] = []) {
    const [dependency, setDependency] = useState({})
    const [state, dispatch] = useReducer(
        (
            state: {
                loading: boolean
                error: undefined | Error
                value: undefined | T
            },
            action: { type: 'LOADING' } | { type: 'VALUE'; payload: T } | { type: 'ERROR'; payload: Error }
        ) => {
            switch (action.type) {
                case 'LOADING':
                    return {
                        ...state,
                        loading: true
                    }
                case 'VALUE':
                    return {
                        loading: false,
                        error: undefined,
                        value: action.payload
                    }
                case 'ERROR':
                    return {
                        ...state,
                        loading: false,
                        error: action.payload
                    }
            }
        },
        initialState
    )

    const renderedRef = useRef(false)
    useEffect(() => {
        if (renderedRef.current) dispatch({ type: 'LOADING' })
        else renderedRef.current = true
        getPromise().then(
            result => dispatch({ type: 'VALUE', payload: result }),
            e => {
                console.error('usePromise:', { e })
                dispatch({ type: 'ERROR', payload: e })
            }
        )
    }, [...deps, dependency, getPromise])

    return [state.value, state.loading, state.error, useCallback(() => setDependency({}), [])] as const
}
