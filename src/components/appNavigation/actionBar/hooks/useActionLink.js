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

//assets
import DiscordIcon from '../../../../assets/logos/socials/discord.png'
import DiscourseIcon from '../../../../assets/logos/socials/discourse.png'
import XIcon from '../../../../assets/logos/socials/Twitter-X.png'
import TgIcon from '../../../../assets/logos/socials/telegram.png'
import FacebookIcon from '../../../../assets/logos/socials/facebook.png'
import MediumIcon from '../../../../assets/logos/socials/medium.png'
import GdWebIcon from '../../../../assets/logos/socials/GdLogo.png'
import InstaIcon from '../../../../assets/logos/socials/instagram.png'
import LinkedinIcon from '../../../../assets/logos/socials/linkedin.png'

const { learnUrl, useGdUrl, donateUrl, voteUrl, goodSwapUrl } = Config

const addExtraProps = (value, key) => ({
  ...value,
  wasClickedProp: `${key}Clicked`,
  icon: value.icon || key,
})

export const socials = mapValues(
  {
    gdw: {
      icon: GdWebIcon,
      url: 'https://ubi.gd/3RpmmLf',
      event: GOTO_GDWEB,
    },
    tg: {
      icon: TgIcon,
      url: 'https://ubi.gd/3GF6f78',
      event: GOTO_TG,
    },
    x: {
      icon: XIcon,
      url: 'https://ubi.gd/twitter',
      event: GOTO_X,
    },
    dsc: {
      icon: DiscourseIcon,
      url: 'https://ubi.gd/3RQFtiN',
      event: GOTO_DISCOURSE,
    },
    inst: {
      icon: InstaIcon,
      url: 'https://ubi.gd/3RHJAxx',
      event: GOTO_INSTA,
    },
    dis: {
      icon: DiscordIcon,
      url: 'https://ubi.gd/48wdaLR',
      event: GOTO_DISCORD,
    },
    med: {
      icon: MediumIcon,
      url: 'https://ubi.gd/3tm8GVT',
      event: GOTO_MEDIUM,
    },
    fb: {
      icon: FacebookIcon,
      url: 'https://ubi.gd/48fL3At',
      event: GOTO_FB,
    },
    link: {
      icon: LinkedinIcon,
      url: 'https://ubi.gd/linkedin',
      event: GOTO_LINKIN,
    },
  },
  addExtraProps,
)

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
    gooddapp: {
      url: goodSwapUrl,
      event: GOTO_GOODSWAP,
    },
  },
  addExtraProps,
)

export default (linkId, isSocial) => {
  const userStorage = useUserStorage()
  const { userProperties } = userStorage
  const { icon, wasClickedProp, url, event } = isSocial ? socials[linkId] : externals[linkId]

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
