export default (str, wordsCount) => {
  return str
    .split(' ')
    .slice(0, -wordsCount)
    .join(' ')
}
