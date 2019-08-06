const getEventSettingsByType = (theme, type) => {
  return (
    {
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
      sendcancelled: {
        color: theme.colors.orange,
        name: 'clock-filled',
      },
      sendpending: {
        color: theme.colors.orange,
        name: 'clock-filled',
        withoutAmount: true,
      },
      invite: {
        color: theme.colors.primary,
        name: 'system-filled',
        withoutAmount: true,
      },
      feedback: {
        color: theme.colors.primary,
        name: 'system-filled',
        withoutAmount: true,
      },
      empty: {
        color: theme.colors.lightGray,
      },
    }[type] || undefined
  )
}

export default getEventSettingsByType
