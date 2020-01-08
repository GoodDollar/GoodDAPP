import _ from 'lodash'
import './mock-browser'
import { createClients, Timeout } from './createClients'

const failedTests = {}
let successCount = 0
const failed = error => {
  let message = error.message || JSON.stringify(error)
  console.log({ error, stack: error.stack })
  failedTests[message] === undefined ? (failedTests[message] = 1) : (failedTests[message] += 1)
}
const success = () => {
  successCount += 1
}
const run = async numTests => {
  console.info('Waiting for clients to initialize')
  let clients = await createClients(numTests)
  let promises = []
  const start = Date.now()

  for (let i = 0; i < clients.length; i++) {
    let client = clients[i]
    promises.push(
      client
        .saveProfile()
        .then(success)
        .catch(failed)
    )
    await Timeout(1000)
  }
  console.info('Waiting for clients to finish saving profiles')
  await Promise.all(promises)
  const promisesResults = await Promise.all(promises)
  const totalTime = (Date.now() - start) / 1000
  const TPS = successCount / totalTime
  const newEmails = clients.map(c => c.randomEmail.toLowerCase())
  let emails = await global.gun.get('users/byemail').then(o => Object.keys(o))
  let emailDiff = _.difference(newEmails, emails)
  console.info('Done running tests', {
    total: promises.length,
    failedTests,
    successCount,
    gundbWriteErrors: emailDiff.length,
    totalTime,
    TPS,
  })

  if (emailDiff.length > 0) {
    console.error('Not all profiles written to gun', { emailDiff })
  }
  process.exit(-1)
}
let numTests = process.argv[2]
console.info('arrgs', process.argv, numTests)
run(numTests)
