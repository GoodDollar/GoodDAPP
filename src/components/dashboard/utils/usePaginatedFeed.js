import { useCallback, useEffect, useRef, useState } from 'react'
import { concat, noop, uniqBy } from 'lodash'

import { combineLatest } from 'rxjs'
import { onFirst, replayable } from '../../../lib/utils/rxjs'

import userStorage from '../../../lib/gundb/UserStorage'
import { PAGE_SIZE } from './feed'

const usePaginatedFeed = (onFeedLoaded = noop) => {
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
    (reset = false, onLoaded = noop) => {
      unsubscribeFromAggregated()

      if (reset) {
        pagesObservablesRef.current = []
      }

      pagesObservablesRef.current.push(
        userStorage.userFeed.getFormattedEvents(PAGE_SIZE, reset).pipe(
          onFirst((pageItems, error) => {
            if (!error) {
              onLoaded(pageItems, reset)
            }
          }),
          replayable(),
        ),
      )

      aggregatedSubscriptionRef.current = combineLatest(pagesObservablesRef.current).subscribe(pagesItems =>
        setFeed(uniqBy(concat(...pagesItems), 'id')),
      )
    },
    [setFeed, unsubscribeFromAggregated],
  )

  const loadFirstPage = useCallback((onLoaded = noop) => loadPage(true, onLoaded), [loadPage])

  const onFeedUpdated = useCallback(() => {
    loadFirstPage()
  }, [loadFirstPage])

  const subscribeToFeed = useCallback(() => {
    loadFirstPage(items => {
      onFeedLoaded(items)
      setLoaded(true)

      subscribedRef.current = true
    })
  }, [onFeedLoaded, loadFirstPage, setLoaded])

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

  return [feed, loaded, subscribeToFeed]
}

export default usePaginatedFeed
