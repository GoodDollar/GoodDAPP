export const delay = (t, v) => {
  return new Promise(function(resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}
