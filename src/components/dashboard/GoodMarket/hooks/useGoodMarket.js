import { useCallback, useState } from 'react'

import { fireEvent, GOTO_MARKET } from '../../../../lib/analytics/analytics'
import { useUserStorage } from '../../../../lib/wallet/GoodWalletProvider'
import Config from '../../../../config/config'
import { openLink } from '../../../../lib/utils/linking'

const { marketUrl } = Config
const wasClickedProp = 'goodMarketClicked'

export default () => {
  const userStorage = useUserStorage()
  const { userProperties } = userStorage
  const goToMarket = useCallback(() => openLink(marketUrl), [])
  const [wasClicked, setWasClicked] = useState(userProperties.get(wasClickedProp))

  const trackClicked = useCallback(() => {
    fireEvent(GOTO_MARKET, {
      firstTime: !wasClicked,
    })

    if (wasClicked) {
      return
    }

    userProperties.safeSet(wasClickedProp, true)
    setWasClicked(true)
  }, [wasClicked, setWasClicked])

  return { wasClicked, trackClicked, goToMarket }
}
