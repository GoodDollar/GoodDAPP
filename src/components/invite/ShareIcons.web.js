import React, { useCallback, useMemo } from 'react'

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

const createShareButtons = (shareTitle, shareMessage) => [
  {
    name: 'whatsapp-1',
    service: 'whatsapp',
    Component: WhatsappShareButton,
    color: '#25D066',
    size: 20,
    title: shareMessage,
    separator: '',
  },
  {
    name: 'facebook-1',
    service: 'facebook',
    Component: FacebookShareButton,
    color: theme.colors.facebookBlue,
    size: 20,
    quote: shareMessage,
    hashtag: '#GoodDollar',
  },
  {
    name: 'twitter-1',
    service: 'twitter',
    Component: TwitterShareButton,
    color: '#1DA1F3',
    title: shareMessage,
    hashtags: ['GoodDollar', 'UBI'],
  },

  {
    name: 'telegram',
    service: 'telegram',
    Component: TelegramShareButton,
    color: '#30A6DE',
    title: shareMessage,
  },
  {
    name: 'envelope',
    service: 'email',
    Component: EmailShareButton,
    color: theme.colors.googleRed,
    size: 20,
    subject: shareTitle,
    body: shareMessage,
    separator: '',
  },
]

const ShareIcon = ({ name, service, ...props }) => {
  const onShare = useCallback(() => fireEvent(INVITE_SHARE, { method: service }), [service])

  return <IconButton {...props} name={name} circleSize={36} onPress={onShare} />
}

const ShareIcons = ({ shareTitle, shareMessage, shareUrl, styles }) => {
  const shareButtons = useMemo(() => createShareButtons(shareTitle, shareMessage), [shareTitle, shareMessage])

  return (
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
}

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
