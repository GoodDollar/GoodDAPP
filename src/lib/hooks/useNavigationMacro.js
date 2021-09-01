import { useCallback, useContext } from 'react'
import { NavigationContext } from '@react-navigation/core'
import { memoize, noop } from 'lodash'

import logger from '../logger/js-logger'

const log = logger.get('useNavigationMacro')

const ALLOWED_METHODS = ['navigate', 'push']

const MACRO_REGEXP = /^(\w[\w\d]+?)\((.*)\)$/
const MACRO_ARGS_SEPARATOR_REGEXP = /,\s*/

const parseMacro = memoize(macro => {
  try {
    if (!macro) {
      return []
    }

    const [, method, args] = MACRO_REGEXP.exec(macro)
    const parsedArgs = args.split(MACRO_ARGS_SEPARATOR_REGEXP).map(JSON.parse)

    return [method, parsedArgs]
  } catch (exception) {
    const { message } = exception

    log.warn(`Failed to parse macro '${macro}'`, message, exception)
    return []
  }
})

export default (macro, fallbackFn = noop) => {
  const navigation = useContext(NavigationContext)

  return useCallback(() => {
    const [method, args] = parseMacro(macro)

    if (method && ALLOWED_METHODS.includes(method)) {
      navigation[method](...args)
      return
    }

    fallbackFn(navigation)
  }, [navigation, macro, fallbackFn])
}
