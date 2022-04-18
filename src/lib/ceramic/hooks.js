import Config from '../../config/config'
import createABTesting from '../hooks/useABTesting'

const { getTestVariant, useABTesting } = createABTesting('CERAMIC_FEED', Config.ceramicABTestPercentage)
const _isEnabled = ab => 'A' === ab

export const isCeramicFeedEnabled = async () => {
  const { ab } = await getTestVariant()

  return _isEnabled(ab)
}

export const useIsCeramicFeedEnabled = () => {
  const [, ab] = useABTesting()

  return _isEnabled(ab)
}

export const useCeramicFeedABTesting = useABTesting
