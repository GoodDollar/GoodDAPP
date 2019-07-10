const getEventSettingsByType = (theme, type) => {
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
    },
    empty: {
      color: theme.colors.empty
    }
  }
  return colorsByType[type]
}

export default getEventSettingsByType
