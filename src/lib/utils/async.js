import { debounce } from 'lodash'

export const delay = (t, v) => {
  return new Promise(function(resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}

export const onPressFix = cb => debounce(cb, 500, { leading: true, trailing: false })
