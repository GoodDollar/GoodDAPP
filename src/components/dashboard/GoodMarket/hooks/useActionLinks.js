import { useCallback, useState } from 'react'

import { fireEvent } from '../../../../lib/analytics/analytics'
import { useUserStorage } from '../../../../lib/wallet/GoodWalletProvider'
import Config from '../../../../config/config'
import { openLink } from '../../../../lib/utils/linking'

const { learnUrl, useGdUrl, donateUrl, voteUrl } = Config
const externals = {
  learn: {
    url: learnUrl,
    event: 'GOTO_LEARN',
  },
  useGd: {
    url: useGdUrl,
    event: 'GOTO_USEGD',
  },
  donate: {
    url: donateUrl,
    event: 'GOTO_DONATE',
  },
  vote: {
    url: voteUrl,
    event: 'GOTO_VOTE',
  },
}
const wasClickedProp = '<actionItem>Clicked' //todo: await confirmation if dialog is to be used or not

export default () => {
  const userStorage = useUserStorage()
  const { userProperties } = userStorage
  const goToExternal = useCallback(src => openLink(externals[src].url), [])
  const [wasClicked, setWasClicked] = useState(userProperties.get(wasClickedProp))

  const trackClicked = useCallback(
    src => {
      fireEvent(externals[src].event, {
        firstTime: !wasClicked,
      })

      if (wasClicked) {
        return
      }

      userProperties.safeSet(wasClickedProp, true)
      setWasClicked(true)
    },
    [wasClicked, setWasClicked],
  )

  return { wasClicked, trackClicked, goToExternal }
}
