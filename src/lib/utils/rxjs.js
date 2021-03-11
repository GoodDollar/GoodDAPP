import { once } from 'lodash'
import { Observable } from 'rxjs'
import { finalize, shareReplay, tap } from 'rxjs/operators'

const createFromGunNode = (node, once = false) =>
  new Observable(subscriber => {
    let eventListener
    const unsubscribe = () => {
      if (!eventListener) {
        return
      }

      eventListener.off()
    }

    node.on((value, _, __, listener) => {
      subscriber.next(value)

      if (once) {
        listener.off()
      } else if (!eventListener) {
        eventListener = listener
      }
    })

    return unsubscribe
  })

export const replayable = () => source =>
  new Observable(subscriber => {
    const subscription = source.subscribe(value => subscriber.next(value), error => subscriber.error(error))

    return () => subscription.unsubscribe()
  }).pipe(shareReplay(1))

export const onFirst = callback => source => {
  const trigger = once((value, error) => callback(value, error))

  return source.pipe(tap(value => trigger(value), error => trigger(undefined, error)))
}

export const onLast = callback => source => {
  let lastValue
  let lastError

  return source.pipe(
    tap(value => (lastValue = value), error => (lastError = error)),
    finalize(() => callback(lastValue, lastError)),
  )
}

export const fromGunNode = node => createFromGunNode(node)

export const ofGunNode = node => createFromGunNode(node, true)
