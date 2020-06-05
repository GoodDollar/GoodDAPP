import numeral from 'numeral'

// use this function to format the number to be with the abbreviations (i.e. 100 => 1K, 10000 => 10K, 2000000 => 2M, 20000000 => 20M)
export const formatNumberToBeWithAbbreviations = (number, customFormat) => {
  const detectFormat = customFormat || Math.floor(Math.log(number) / Math.LN10) % 3 === 2 ? '0a' : '0.[0]a'

  return numeral(number)
    .format(detectFormat)
    .toUpperCase()
}
