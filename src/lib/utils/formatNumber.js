import numeral from 'numeral'

// use this function to format the number to be with the abbreviations (i.e. 100 => 1K, 10000 => 10K, 2000000 => 2M, 20000000 => 20M)
export const formatWithSIPrefix = (number, customFormat = null) => {
  let format = customFormat

  if (!format) {
    format = Math.floor(Math.log(number) / Math.LN10) % 3 === 2 ? '0a' : '0.[0]a'
  }

  return numeral(number)
    .format(format)
    .toUpperCase()
}

export const formatWithThousandsSeparator = number => {
  return numeral(number).format('0[,]0.00')
}

export const formatWithAbbreviations = (number, decPlaces = 1) => {
  return numeral(number).format(`${'0.'}${'0'.repeat(decPlaces)}a`)
}
