// @flow
import { useCallback, useEffect, useState } from 'react'

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

const initialErrorState = { dirty: false, value: null, error: null, isValid: false }

const useValidatedValueState = (initialValue: State, getError: (value: any) => Error) => {
  const validate = useCallback(
    (state: State, value: any): ErrorState => {
      const dirty: boolean = Boolean((state && state.dirty) || !!value)

      const error: Error = dirty ? getError(value) : null
      const isValid: boolean = getError(value) == null

      return { error, isValid, dirty }
    },
    [getError],
  )

  const initialize = useCallback((value: any): State => ({ value, ...validate(initialErrorState, value) }), [validate])

  const [state, setState] = useState({ value: initialValue })

  const setValue = useCallback(
    (value: any) =>
      setState(state => {
        const { error, isValid, dirty } = validate(state, value)

        return { error, isValid, dirty, value }
      }),
    [setState, validate],
  )

  useEffect(() => {
    setState(initialize(initialValue))
  }, [initialValue, setState, initialize])

  return [state, setValue]
}

export default useValidatedValueState
