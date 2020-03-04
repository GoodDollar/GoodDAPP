// use to remove undefined values from object nested
const removeEmpty = obj => {
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      removeEmpty(obj[key])
    } else if (obj[key] === undefined) {
      delete obj[key]
    }
  })

  return obj
}

export default removeEmpty
