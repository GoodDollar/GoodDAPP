import { useCallback, useEffect, useRef, useState } from 'react'
import { concat, noop, uniqBy } from 'lodash'

import { combineLatest } from 'rxjs'
import { onFirst, replayable } from '../../../lib/utils/rxjs'

import logger from '../../../lib/logger/pino-logger'
import useDebounce from '../../../lib/hooks/useDebounce'
import userStorage from '../../../lib/gundb/UserStorage'
import { PAGE_SIZE } from './feed'

const defaultLogger = logger.child({ from: 'usePaginatedFeed' })

const usePaginatedFeed = (log = defaultLogger) => {
  const [feed, setFeed] = useState([])
  const [loaded, setLoaded] = useState(false)
  const subscribedRef = useRef(false)
  const aggregatedSubscriptionRef = useRef(null)
  const pagesObservablesRef = useRef([])

  const unsubscribeFromAggregated = useCallback(() => {
    if (aggregatedSubscriptionRef.current) {
      aggregatedSubscriptionRef.current.unsubscribe()
      aggregatedSubscriptionRef.current = null
    }
  }, [])

  const loadPage = useCallback(
    (reset = false, onFirstEmit = noop) => {
      log.debug('getFeedPage:', { reset, feeds: feed })

      unsubscribeFromAggregated()

      if (reset) {
        pagesObservablesRef.current = []
      }

      pagesObservablesRef.current.push(
        userStorage.userFeed.getFormattedEvents(PAGE_SIZE, reset).pipe(
          onFirst((feedItems, error) => {
            if (error) {
              log.warn('getFeedPage failed', error.message, error)
            } else {
              log.debug('getFeedPage getFormattedEvents result:', {
                reset,
                res: feedItems,
                resultSize: feedItems.length,
                feedItems: feed.length,
              })
            }

            onFirstEmit(feedItems, error, reset)
          }),
          replayable(),
        ),
      )

      aggregatedSubscriptionRef.current = combineLatest(pagesObservablesRef.current).subscribe(pagesItems =>
        setFeed(uniqBy(concat(...pagesItems), 'id')),
      )
    },
    [setFeed, unsubscribeFromAggregated, log],
  )

  const onFeedUpdated = useCallback(
    event => {
      log.debug('feed cache updated', { event })
      loadPage(true)
    },
    [loadPage],
  )

  const subscribeToFeed = useCallback(() => {
    loadPage(true, (feedItems, error, reset) => {
      if (error) {
        log.error('initDashboard feed failed', error.message, error)
      }

      setLoaded(true)
      subscribedRef.current = true
    })
  }, [loadPage, setLoaded, log])

  const loadNextPage = useCallback(() => {
    if (!loaded) {
      return
    }

    log.debug('getNextFeed called')
    loadPage()
  }, [loaded, loadPage, log])

  const nextPage = useDebounce(loadNextPage, { leading: true })

  useEffect(() => {
    const listener = () => {
      if (subscribedRef.current) {
        onFeedUpdated()
      }
    }

    userStorage.feedEvents.on('updated', listener)
    return () => userStorage.feedEvents.removeListener('updated', listener)
  }, [onFeedUpdated])

  useEffect(() => unsubscribeFromAggregated, [unsubscribeFromAggregated])

  return [feed, loaded, subscribeToFeed, nextPage]
}

export default usePaginatedFeed
