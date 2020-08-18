import { fromPairs, range, invert } from 'lodash'

export const ExceptionCategory = {
  Human: 'human',
  Blockchain: 'blockchain',
  Network: 'network',
  Unexpected: 'unexpected',
}

const MAX_EXCEPTION_CODE = 13
const exceptionCodesMap = fromPairs(range(1, MAX_EXCEPTION_CODE + 1).map(code => [code, `E${code}`]))

export const ExceptionCode = invert(exceptionCodesMap)

/**
 * Decorates exception with pre-defined error code and returns message for the endusers
 *
 * @param {Error} exception Exception to decorate with code & name for Sentry reporting
 * @param {number} withCode Predefined error code
 * @returns Message could be shown for the endusers
 */
export const decorate = (exception, withCode) => {
  const { name, code } = exception
  const codeString = exceptionCodesMap[code]

  if (!code) {
    exception.code = withCode
  }

  if (!name || 'Error' === name) {
    exception.name = codeString
  }

  return `Sorry, Some unexpected error (${codeString}) happened, please try again`
}
