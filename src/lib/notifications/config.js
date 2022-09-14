(() => {
  const date = new Date()

  date.setUTCHours(12, 0, 0, 0)
  return date
})()

const Config = {
  notificationSchedule: 'minute', // repeat in each minute
  notificationTime: new Date(Date.now() + 60 * 1000), // 1 minute after app been started

  // PROD values
  // notificationSchedule: 'day', // repeat daily
  // notificationTime: (() => { // 12 PM UTC
  //   const date = new Date()

  //   date.setUTCHours(12, 0, 0, 0)
  //   return date
  // })(),
}

export default Config
