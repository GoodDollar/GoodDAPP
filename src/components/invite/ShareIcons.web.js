import React, { useCallback, useMemo } from 'react'
import {
  EmailShareButton,
  FacebookShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from 'react-share'

import { theme } from '../theme/styles'
import { fireEvent, INVITE_SHARE } from '../../lib/analytics/analytics'

import { IconButton, Section } from '../common'
import useShareMessages from './useShareMessages'

export default ({ shareUrl }) => {
  const [messages, loaded] = useShareMessages()

  const buttons = useMemo(() => {
    if (!loaded) {
      return []
    }

    const { shareMessage, shortShareMessage, shareTitle } = messages

    return [
      {
        name: 'whatsapp-1',
        service: 'whatsapp',
        Component: WhatsappShareButton,
        color: theme.colors.darkBlue,
        size: 20,
        title: shareMessage,
        separator: '',
      },
      {
        name: 'facebook-1',
        service: 'facebook',
        Component: FacebookShareButton,
        color: theme.colors.darkBlue,
        size: 20,
        quote: shareMessage,
        hashtag: '#GoodDollar',
      },
      {
        name: 'twitter-1',
        service: 'twitter',
        Component: TwitterShareButton,
        color: theme.colors.darkBlue,
        title: shortShareMessage,
      },

      {
        name: 'telegram',
        service: 'telegram',
        Component: TelegramShareButton,
        color: theme.colors.darkBlue,
        title: shareMessage,
      },
      {
        name: 'envelope',
        service: 'email',
        Component: EmailShareButton,
        color: theme.colors.darkBlue,
        size: 20,
        subject: shareTitle,
        body: shareMessage,
        separator: '',
      },
    ]
  }, [messages, loaded])

  const onShare = useCallback(service => {
    fireEvent(INVITE_SHARE, { method: service })
  }, [])

  return (
    <Section.Row style={{ marginTop: theme.paddings.defaultMargin * 2, justifyContent: 'flex-start' }}>
      {buttons.map(({ name, Component, ...props }) => (
        <Section.Stack style={{ marginRight: theme.sizes.defaultDouble }} key={name}>
          <Component
            url={shareUrl}
            {...props}
            beforeOnClick={() => {
              onShare(props.service)
            }}
          >
            <IconButton {...props} name={name} circleSize={36} />
          </Component>
        </Section.Stack>
      ))}
    </Section.Row>
  )
}
