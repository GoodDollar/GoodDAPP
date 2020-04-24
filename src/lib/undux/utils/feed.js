// @flow
import type { Store } from 'undux'
import { throttle } from 'lodash'
import Config from '../../../config/config'
import userStorage from '../../gundb/UserStorage'
import pino from '../../logger/pino-logger'
const logger = pino.child({ from: 'feeds' })

export const PAGE_SIZE = 10

const getMockFeeds = () => {
  return Config.withMockedFeeds
    ? [
        {
          id: '111111111111111111111111111111111111111111111111111111111111333333',
          date: new Date().getTime(),
          type: 'message',
          createdDate: 'Fri Aug 02 2019 15:15:44 GMT-0300 (Argentina Standard Time)',
          status: 'completed',
          data: {
            message:
              '"I can buy food for my children!"\nNairobi, Kenya - 24,600 people are using GD today to buy essential commodities... ',
            endpoint: {
              fullName: 'Maisao Matimbo (Kenya)',
              avatar: null,
              address: null,
            },
          },
        },
        {
          id: '111111111111111111111111111111111111111111111111111111111111222222',
          date: new Date().getTime(),
          type: 'invite',
          createdDate: 'Fri Aug 02 2019 15:15:44 GMT-0300 (Argentina Standard Time)',
          status: 'completed',
          data: {
            message:
              'Send Invites to get more people connected on GoodDollar. You will earn GD and also Help other people to earn.',
            endpoint: {
              fullName: 'Invite friends to GoodDollar',
            },
          },
        },
        {
          id: '111111111111111111111111111111111111111111111111111111111111444444',
          date: new Date().getTime(),
          type: 'feedback',
          createdDate: 'Fri Aug 02 2019 15:15:44 GMT-0300 (Argentina Standard Time)',
          status: 'completed',
          data: {
            message: 'How likely are you to recommend GoodDollar to a friend or colleague?',
            endpoint: {
              avatar: null,
              address: null,
            },
          },
        },
      ]
    : []
}

const getInitial = async (store: Store) => {
  logger.debug('getFeed')
  store.set('feedLoading')(true)
  const feeds =
    (await userStorage
      .getFormattedEvents(PAGE_SIZE, true)
      .catch(e => logger.error('getInitialFeed -> ', e.message, e))) || []
  logger.info({ feeds })
  const mockedFeeds = getMockFeeds()
  store.set('feedLoading')(false)
  store.set('feeds')(feeds.concat(mockedFeeds))
}

export const getNextFeed = async (store: Store) => {
  const newFeeds = await userStorage.getFormattedEvents(PAGE_SIZE, false)
  if (newFeeds.length > 0) {
    const currentFeeds = store.get('feeds') || []
    store.set('feeds')(currentFeeds.concat(newFeeds))
  }
}

export const getInitialFeed = throttle(getInitial, 2000, { leading: true })
