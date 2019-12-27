const isWebApp = () => {
  if (window === undefined) {
    return false
  }
  return (
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true ||
    window.location.search.indexOf('?standalone') >= 0
  )
}
export default isWebApp()
