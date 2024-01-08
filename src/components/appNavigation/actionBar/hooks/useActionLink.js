import { useCallback, useState } from 'react'

import { mapValues } from 'lodash'
import {
  fireEvent,
  GOTO_DISCORD,
  GOTO_DISCOURSE,
  GOTO_DONATE,
  GOTO_FB,
  GOTO_GDWEB,
  GOTO_GOODSWAP,
  GOTO_INSTA,
  GOTO_LEARN,
  GOTO_LINKIN,
  GOTO_MEDIUM,
  GOTO_TG,
  GOTO_USEGD,
  GOTO_VOTE,
  GOTO_X,
} from '../../../../lib/analytics/analytics'
import { useUserStorage } from '../../../../lib/wallet/GoodWalletProvider'
import Config from '../../../../config/config'
import { openLink } from '../../../../lib/utils/linking'

const { learnUrl, useGdUrl, donateUrl, voteUrl, goodSwapUrl } = Config

const addExtraProps = (value, key) => ({
  ...value,
  wasClickedProp: `${key}Clicked`,
  icon: value.icon ?? key,
})

export const externals = mapValues(
  {
    gdw: {
      url: 'https://ubi.gd/3RpmmLf',
      event: GOTO_GDWEB,
    },
    tg: {
      url: 'https://ubi.gd/3GF6f78',
      event: GOTO_TG,
    },
    x: {
      url: 'https://ubi.gd/twitter',
      event: GOTO_X,
    },
    dsc: {
      url: 'https://ubi.gd/3RQFtiN',
      event: GOTO_DISCOURSE,
    },
    inst: {
      url: 'https://ubi.gd/3RHJAxx',
      event: GOTO_INSTA,
    },
    dis: {
      url: 'https://ubi.gd/48wdaLR',
      event: GOTO_DISCORD,
    },
    med: {
      url: 'https://ubi.gd/3tm8GVT',
      event: GOTO_MEDIUM,
    },
    fb: {
      url: 'https://ubi.gd/48fL3At',
      event: GOTO_FB,
    },
    link: {
      url: 'https://ubi.gd/linkedin',
      event: GOTO_LINKIN,
    },
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
    gooddapp: {
      url: goodSwapUrl,
      event: GOTO_GOODSWAP,
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
