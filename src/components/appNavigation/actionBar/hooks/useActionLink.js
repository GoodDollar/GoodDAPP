import { useCallback, useState } from 'react'

import { mapValues } from 'lodash'
import {
  fireEvent,
  GOTO_DONATE,
  GOTO_LEARN,
  GOTO_MARKET,
  GOTO_USEGD,
  GOTO_VOTE,
} from '../../../../lib/analytics/analytics'
import { useUserStorage } from '../../../../lib/wallet/GoodWalletProvider'
import Config from '../../../../config/config'
import { openLink } from '../../../../lib/utils/linking'

const { learnUrl, useGdUrl, donateUrl, voteUrl, marketUrl } = Config

const addExtraProps = (value, key) => ({
  ...value,
  wasClickedProp: `${key}Clicked`,
  icon: value.icon || key,
})

const externals = mapValues(
  {
    learn: {
      url: learnUrl,
      event: GOTO_LEARN,
    },
    usegd: {
      url: useGdUrl,
      event: GOTO_USEGD,
    },
    donate: {
      url: donateUrl,
      event: GOTO_DONATE,
    },
    vote: {
      url: voteUrl,
      event: GOTO_VOTE,
    },
    market: {
      url: marketUrl,
      event: GOTO_MARKET,
    },
  },
  addExtraProps,
)

export default linkId => {
  const userStorage = useUserStorage()
  const { userProperties } = userStorage
  const { icon, wasClickedProp, url, event } = externals[linkId]

  const goToExternal = useCallback(() => openLink(url), [url])
  const [wasClicked, setWasClicked] = useState(() => userProperties.get(wasClickedProp))

  const trackClicked = useCallback(() => {
    fireEvent(event, {
      firstTime: !wasClicked,
    })

    if (wasClicked) {
      return
    }

    userProperties.safeSet(wasClickedProp, true)
    setWasClicked(true)
  }, [userProperties, event, wasClickedProp, wasClicked, setWasClicked])

  return { actionIcon: icon, wasClicked, trackClicked, goToExternal }
}
