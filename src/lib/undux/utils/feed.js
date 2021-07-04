// @flow
import type { Store } from 'undux'
import { throttle } from 'lodash'
import Config from '../../../config/config'
import userStorage from '../../userStorage/UserStorage'
import pino from '../../logger/pino-logger'
import { assertStore } from '../SimpleStore'

const logger = pino.child({ from: 'feeds' })

export const PAGE_SIZE = 20

const getMockFeeds = () => {
  return Config.withMockedFeeds
    ? [
        {
          id: '111111111111111111111111111111111111111111111111111111111111333333',
          date: new Date().toISOString(),
          type: 'message',
          createdDate: new Date('Fri Aug 02 2019 15:15:44 GMT-0300 (Argentina Standard Time)').toISOString(),
          status: 'completed',
          data: {
            message:
              '"I can buy food for my children!"\nNairobi, Kenya - 24,600 people are using GD today to buy essential commodities... ',
            endpoint: {
              displayName: 'Maisao Matimbo (Kenya)',
              avatar: null,
              address: null,
            },
          },
        },
        {
          id: '111111111111111111111111111111111111111111111111111111111111222222',
          date: new Date().toISOString(),
          type: 'invite',
          createdDate: new Date('Fri Aug 02 2019 15:15:44 GMT-0300 (Argentina Standard Time)').toISOString(),
          status: 'completed',
          data: {
            message:
              'Send Invites to get more people connected on GoodDollar. You will earn GD and also Help other people to earn.',
            endpoint: {
              displayName: 'Invite friends to GoodDollar',
            },
          },
        },
        {
          id: '111111111111111111111111111111111111111111111111111111111111444444',
          date: new Date().toISOString(),
          type: 'feedback',
          createdDate: new Date('Fri Aug 02 2019 15:15:44 GMT-0300 (Argentina Standard Time)').toISOString(),
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
  if (!assertStore(store, logger, 'getInitial failed')) {
    return
  }

  store.set('feedLoading')(true)

  const feeds =
    (await userStorage
      .getFormattedEvents(PAGE_SIZE, true)
      .catch(e => logger.error('getInitialFeed failed:', e.message, e))) || []

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
