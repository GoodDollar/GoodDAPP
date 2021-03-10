import { Observable } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

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

export const fromGunNode = node => createFromGunNode(node)

export const ofGunNode = node => createFromGunNode(node, true)
