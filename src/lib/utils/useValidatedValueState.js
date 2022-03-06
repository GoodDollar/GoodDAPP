// @flow
import { useReducer } from 'react'

type ValueState = {
  value: any,
}

type Error = string | null

type ErrorState = {
  isValid: boolean,
  dirty: boolean,
  error: Error,
}

type State = ErrorState & ValueState

type Action = {
  type?: string,
  payload?: {
    value: any,
  },
}

const initialErrorState = { dirty: false, value: null, error: null, isValid: false }

const useValidatedValueState = (initialValue: State, getError: (value: any) => Error) => {
  const getErrorStateForValue = (state: State, value: any): ErrorState => {
    const dirty: boolean = Boolean((state && state.dirty) || !!value)

    const error: Error = dirty ? getError(value) : null
    const isValid: boolean = getError(value) == null

    return { error, isValid, dirty }
  }

  function init(value: any): State {
    return { value, ...getErrorStateForValue(initialErrorState, value) }
  }

  function reducer(state: State, action: Action) {
    const { value } = action.payload || {}

    switch (action.type) {
      case 'SET_VALUE': {
        const { error, isValid, dirty } = getErrorStateForValue(state, value)
        return { error, isValid, dirty, value }
      }
      case 'RESET':
        return init(value)
      default:
        throw new Error(`Unsupported Action: ${action.type}`)
    }
  }

  const [state, dispatch] = useReducer(reducer, {
    value: initialValue,
    ...getErrorStateForValue(initialErrorState, initialValue),
  })
  const setValue = (value: any) => dispatch({ type: 'SET_VALUE', payload: { value } })
  const resetValue = (value: any) => dispatch({ type: 'RESET' })

  return [state, setValue, resetValue]
}

export default useValidatedValueState
