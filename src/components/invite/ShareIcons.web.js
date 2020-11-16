import React, { useCallback } from 'react'

import {
  EmailShareButton,
  FacebookShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from 'react-share'

import { IconButton, Null, Section } from '../common'

import { isMobileWeb } from '../../lib/utils/platform'
import { fireEvent, INVITE_SHARE } from '../../lib/analytics/analytics'

import { theme } from '../theme/styles'
import { withStyles } from '../../lib/styles'

const shareButtons = [
  {
    name: 'whatsapp-1',
    service: 'whatsapp',
    Component: WhatsappShareButton,
    color: '#25D066',
    size: 20,
    title: "Hey,\nCheck out GoodDollar it's a digital coin that gives anyone who joins a small daily income (UBI).\n\n",
    separator: '',
  },
  {
    name: 'facebook-1',
    service: 'facebook',
    Component: FacebookShareButton,
    color: theme.colors.facebookBlue,
    size: 20,
    quote: "Hey,\nCheck out GoodDollar it's a digital coin that gives anyone who joins a small daily income (UBI).\n\n",
    hashtag: '#GoodDollar',
  },
  {
    name: 'twitter-1',
    service: 'twitter',
    Component: TwitterShareButton,
    color: '#1DA1F3',
    title: "Hey,\nCheck out GoodDollar it's a digital coin that gives anyone who joins a small daily income (UBI).\n\n",
    hashtags: ['GoodDollar', 'UBI'],
  },

  {
    name: 'telegram',
    service: 'telegram',
    Component: TelegramShareButton,
    color: '#30A6DE',
    title: "Hey,\nCheck out GoodDollar it's a digital coin that gives anyone who joins a small daily income (UBI).\n\n",
  },
  {
    name: 'envelope',
    service: 'email',
    Component: EmailShareButton,
    color: theme.colors.googleRed,
    size: 20,
    subject: 'I signed up to GoodDollar. Join me.',
    body: "Hey,\nCheck out GoodDollar it's a digital coin that gives anyone who joins a small daily income (UBI).\n\n",
    separator: '',
  },
]

const ShareIcon = ({ name, service, ...props }) => {
  const onShare = useCallback(() => fireEvent(INVITE_SHARE, { method: service }), [service])

  return <IconButton {...props} name={name} circleSize={36} onPress={onShare} />
}

const ShareIcons = ({ shareUrl, styles }) => (
  <Section.Row style={styles.wrapper}>
    <Section.Text fontSize={11} style={styles.title}>
      Or share with:
    </Section.Text>
    {shareButtons.map(({ name, Component, ...props }) => (
      <Section.Stack style={styles.buttonWrapper} key={name}>
        <Component url={shareUrl} {...props}>
          <ShareIcon name={name} {...props} />
        </Component>
      </Section.Stack>
    ))}
  </Section.Row>
)

const getStylesFromProps = ({ theme }) => {
  const { paddings, colors } = theme
  const { defaultMargin } = paddings

  return {
    wrapper: {
      marginTop: defaultMargin * 2,
    },
    title: {
      flex: 1,
      color: colors.secondary,
    },
    buttonWrapper: {
      marginLeft: defaultMargin * 1.5,
    },
  }
}

export default (isMobileWeb ? Null : withStyles(getStylesFromProps)(ShareIcons))
