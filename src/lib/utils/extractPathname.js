const regex = /.+?\:\/\/.+?(\/.+?)(?:#|\?|$)/

export default url => regex.exec(url)[1]
