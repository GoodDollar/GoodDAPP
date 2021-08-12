import { template } from 'lodash'

export default tmplString => template(tmplString, { interpolate: /{(\S+?)}/g })
