import { useCallback, useState } from 'react'

import { fireEvent, GOTO_MARKET } from '../../../../lib/analytics/analytics'
import userStorage from '../../../../lib/userStorage/UserStorage'
import Config from '../../../../config/config'
import { openLink } from '../../../../lib/utils/linking'

const { marketUrl } = Config
const wasClickedProp = 'goodMarketClicked'

export default () => {
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

    userProperties.set(wasClickedProp, true)
    setWasClicked(true)
  }, [wasClicked, setWasClicked])

  return { wasClicked, trackClicked, goToMarket }
}
