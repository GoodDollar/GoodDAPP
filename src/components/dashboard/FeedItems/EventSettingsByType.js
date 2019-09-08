const getEventSettingsByType = (theme, type) => {
  const styles = {
    claim: {
      actionSymbol: '+',
      color: theme.colors.lightGreen,
      name: 'claim-filled',
    },
    send: {
      actionSymbol: '-',
      color: theme.colors.red,
      name: 'send-filled',
    },
    sendcompleted: {
      actionSymbol: '-',
      color: theme.colors.red,
      name: 'send-filled',
    },
    sendcancelled: {
      actionSymbol: '-',
      color: theme.colors.orange,
      name: 'clock-filled',
    },
    senderror: {
      color: theme.colors.primary,
      name: 'system-filled',
      withoutAmount: true,
    },
    sendpending: {
      actionSymbol: '-',
      color: theme.colors.orange,
      name: 'clock-filled',
    },
    receive: {
      actionSymbol: '+',
      color: theme.colors.lightGreen,
      name: 'claim-filled',
    },
    withdraw: {
      actionSymbol: '+',
      color: theme.colors.green,
      name: 'receive-filled',
    },
    message: {
      color: theme.colors.purple,
      name: 'social-good-filled',
      withoutAmount: true,
    },
    invite: {
      color: theme.colors.primary,
      name: 'system-filled',
      withoutAmount: true,
    },
    welcome: {
      color: theme.colors.primary,
      name: 'system-filled',
      withoutAmount: true,
      withoutAvatar: true,
    },
    feedback: {
      color: theme.colors.primary,
      name: 'system-filled',
      withoutAmount: true,
    },
    empty: {
      color: theme.colors.lightGray,
    },
  }
  return styles[type] || styles.empty
}

export default getEventSettingsByType
