const getEventSettingsByType = (theme, type) => {
  const colorsByType = {
    claim: {
      color: theme.colors.green,
      name: 'claim-filled',
    },
    send: {
      color: theme.colors.red,
      name: 'send-filled',
    },
    sendcompleted: {
      color: theme.colors.red,
      name: 'send-filled',
    },
    receive: {
      color: theme.colors.green,
      name: 'claim-filled',
    },
    withdraw: {
      color: theme.colors.green,
      name: 'receive-filled',
    },
    message: {
      color: theme.colors.purple,
      name: 'social-good-filled',
    },
    sendcancelled: {
      color: theme.colors.orange,
      name: 'clock-filled',
    },
    sendpending: {
      color: theme.colors.orange,
      name: 'clock-filled',
    },
    feedback: {
      color: theme.colors.primary,
      name: 'system-filled',
    },
    empty: {
      color: theme.colors.lightGray,
    },
  }
  return colorsByType[type]
}

export default getEventSettingsByType
