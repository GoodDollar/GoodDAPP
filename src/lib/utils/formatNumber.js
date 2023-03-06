import numeral from 'numeral'

// use this function to format the number to be with the abbreviations (i.e. 100 => 1K, 10000 => 10K, 2000000 => 2M, 20000000 => 20M)
export const formatWithSIPrefix = (number, customFormat = null) => {
  let format = customFormat

  if (!format) {
    format = Math.floor(Math.log10(number)) % 3 === 2 ? '0a' : '0.[0]a'
  }

  return numeral(number)
    .format(format)
    .toUpperCase()
}

export const formatWithThousandsSeparator = number => {
  return numeral(number).format('0[,]0.00')
}

export const formatWithFixedValueDigits = (number, nonZeroDigits = 3) => {
  // validate for NaN and finite value, also log(0) isn't defined in math
  // JS fn returns -Infinity for it, so we need to handle this case separately
  if (!number || isNaN(number) || !isFinite(number)) {
    return formatWithAbbreviations(0)
  }

  const exponent10 = Math.floor(Math.log10(number))
  const alignToPlaces = number < 1000 ? exponent10 : exponent10 % 3
  const decPlaces = Math.max(nonZeroDigits - alignToPlaces - 1, 0)
  return formatWithAbbreviations(number, decPlaces)
}

export const formatWithAbbreviations = (number, decPlaces = 1) => {
  let format = '0'

  if (!isNaN(decPlaces) && isFinite(decPlaces)) {
    if (decPlaces > 0) {
      format += '.0'
    }

    if (decPlaces > 1) {
      format += `[${'0'.repeat(decPlaces - 1)}]`
    }
  }

  return numeral(number).format(format + 'a')
}
