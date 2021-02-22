const regex = /.+?:\/\/.+?(\/.+?)(?:#|\?|$)/

export default url => {
  const r = regex.exec(url)
  return r && r.length > 0 ? r[1] : '/'
}
