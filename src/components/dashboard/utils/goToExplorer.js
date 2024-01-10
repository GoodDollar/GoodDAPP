import Config from '../../../config/config'
import { openLink } from '../../../lib/utils/linking'

const goToExplorer = (address, chain, type) => {
  const networkExplorerUrl = Config.ethereum[chain ?? 42220]?.explorer
  if (!networkExplorerUrl) {
    return
  }

  return openLink(`${networkExplorerUrl}/${type}/${encodeURIComponent(address)}`, '_blank')
}

export default goToExplorer
