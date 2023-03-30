import { useCallback } from 'react'

import { fireEvent } from '../../../../lib/analytics/analytics'
import { useUserStorage } from '../../../../lib/wallet/GoodWalletProvider'
import Config from '../../../../config/config'
import { openLink } from '../../../../lib/utils/linking'

const { learnUrl, useGdUrl, donateUrl, voteUrl } = Config
const externals = {
  learn: {
    url: learnUrl,
    event: 'GOTO_LEARN',
    wasClickedProp: 'learn Clicked',
  },
  usegd: {
    url: useGdUrl,
    event: 'GOTO_USEGD',
    wasClickedProp: 'useGd Clicked',
  },
  donate: {
    url: donateUrl,
    event: 'GOTO_DONATE',
    wasClickedProp: 'donate Clicked',
  },
  vote: {
    url: voteUrl,
    event: 'GOTO_VOTE',
    wasClickedProp: 'vote Clicked',
  },
}

export default () => {
  const userStorage = useUserStorage()
  const { userProperties } = userStorage
  const goToExternal = useCallback(src => openLink(externals[src].url), [])

  const trackClicked = useCallback(
    src => {
      const wasClicked = userProperties.get(externals[src].wasClickedProp)

      if (wasClicked) {
        return
      }

      fireEvent(externals[src].event, {
        firstTime: true,
      })

      userProperties.safeSet(externals[src].wasClickedProp, true)
    },
    [userProperties],
  )

  return { trackClicked, goToExternal }
}
