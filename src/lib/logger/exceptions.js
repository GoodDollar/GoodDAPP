import { fromPairs, range } from 'lodash'

export const ExceptionCategory = {
  Human: 'human',
  Blockchain: 'blockchain',
  Network: 'network',
  Unexpected: 'unexpected',
}

const MAX_EXCEPTION_CODE = 13
const codeToString = code => `E${code}`

export const ExceptionCode = fromPairs(range(1, MAX_EXCEPTION_CODE + 1).map(code => [codeToString(code), code]))

/**
 * Decorates exception with pre-defined error code and returns message for the endusers
 *
 * @param {Error} exception Exception to decorate with code & name for Sentry reporting
 * @param {number} withCode Predefined error code
 * @returns Message could be shown for the endusers
 */
export const decorate = (exception, withCode) => {
  const { name, code } = exception
  const codeString = codeToString(code)

  if (!code) {
    exception.code = withCode
  }

  if (!name || 'Error' === name) {
    exception.name = codeString
  }  

  return `Sorry, something unexpected happened, please try again. \nError: ${codeString}`
}
