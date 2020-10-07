import { useCallback, useState } from 'react'
import userStorage from '../../../../lib/gundb/UserStorage'
import Config from '../../../../config/config'
import { openLink } from '../../../../lib/utils/linking'

const { marketUrl } = Config
const wasOpenedProp = 'hasOpenedGoodMarket'

export default () => {
  const { userProperties } = userStorage
  const [wasOpened, setWasOpened] = useState(userProperties.get(wasOpenedProp))

  const goToMarket = useCallback(() => {
    if (!wasOpened) {
      userProperties.set(wasOpenedProp, true)
      setWasOpened(true)
    }

    openLink(marketUrl)
  }, [wasOpened])

  return [wasOpened, goToMarket]
}
