export default (fromUrl = null) => {
  const { location } = window

  if (!fromUrl) {
    location.reload(true)
    return
  }

  location.replace(fromUrl)
}
