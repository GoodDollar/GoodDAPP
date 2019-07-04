import React from 'react'
import { withTheme } from 'react-native-paper'
import { Icon } from '../../common'
import { listStyles } from './EventStyles'

const getIconByType = (theme, type) => {
  const colorsByType = {
    send: {
      color: theme.colors.send,
      name: 'send-filled'
    },
    receive: {
      color: theme.colors.receive,
      name: 'claim-filled'
    },
    withdraw: {
      color: theme.colors.receive,
      name: 'receive-filled'
    },
    message: {
      color: theme.colors.message,
      name: 'social-good-filled'
    },
    notification: {
      color: theme.colors.notification,
      name: 'clock-filled'
    },
    feedback: {
      color: theme.colors.feedback,
      name: 'system-filled'
    }
  }
  return colorsByType[type]
}

const EventIcon = ({ type, theme }) => {
  const icon = getIconByType(theme, type)
  return <Icon color={icon.color} size={34} name={icon.name} containerStyle={listStyles.eventIcon} />
}

export default withTheme(EventIcon)
