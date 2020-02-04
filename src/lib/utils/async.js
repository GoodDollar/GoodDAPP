import _debounce from 'lodash/debounce'
export const delay = (t, v) => {
  return new Promise(function(resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}

export const onPressFix = cb => _debounce(cb, 500, { leading: true, trailing: false })
