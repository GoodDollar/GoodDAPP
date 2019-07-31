const getEventSettingsByType = (theme, type) => {
  return (
    {
      claim: {
        actionSymbol: '+',
        color: theme.colors.green,
        name: 'claim-filled',
      },
      send: {
        actionSymbol: '-',
        color: theme.colors.red,
        name: 'send-filled',
      },
      receive: {
        actionSymbol: '+',
        color: theme.colors.green,
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
      },
      notification: {
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
    }[type] || undefined
  )
}

export default getEventSettingsByType
