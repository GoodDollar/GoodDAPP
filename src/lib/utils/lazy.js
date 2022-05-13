import { lazy } from 'react'
import { suspenseWithIndicator } from '../../components/common/view/LoadingIndicator'

const exportDefault = component => module => ({ default: module[component] })

const lazyExport = (dynamicImport, ...components) =>
  components.map(component => suspenseWithIndicator(() => dynamicImport().then(exportDefault(component))))

export default lazyExport
