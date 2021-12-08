import { isPlainObject, memoize, template } from 'lodash'

const templateFactory = memoize(tmplString => template(tmplString, { interpolate: /{(\S+?)}/g }))

export default (tmplString, variables = null) => {
  const templateFn = templateFactory(tmplString)

  return isPlainObject(variables) ? templateFn(variables) : templateFn
}
