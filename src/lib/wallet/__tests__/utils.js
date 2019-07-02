import { gdToWei, maskToWei, moneyRegexp, numberWithCommas, toMask, toRawValue, weiToGd, weiToMask } from '../utils'

describe('GD to Wei', () => {
  it('should convert gooddollars to wei and return wei value', () => {
    const wei = gdToWei('12.34')
    expect(wei).toEqual('1234')
  })

  it('should convert gooddollars without decimals to wei and return wei value', () => {
    const wei = gdToWei('12')
    expect(wei).toEqual('1200')
  })

  it('should convert empty string to 0 wei', () => {
    const wei = gdToWei('')
    expect(wei).toEqual('0')
  })
})

describe('Mask to Wei', () => {
  it('should convert masked value with decimals to wei and return wei value', () => {
    const wei = maskToWei('345,12.34')
    expect(wei).toEqual('3451234')
  })

  it('should convert integer masked value to wei and return wei value', () => {
    const wei = maskToWei('345,12')
    expect(wei).toEqual('34512')
  })
})

describe('Money regex', () => {
  it('should return true if it is tested with an integer', () => {
    const isMoney = moneyRegexp.test('123456789')
    expect(isMoney).toBeTruthy()
  })

  it('should return true if it is tested with a decimal', () => {
    const isMoney = moneyRegexp.test('1234567.89')
    expect(isMoney).toBeTruthy()
  })

  it('should return true if it is tested with 0 (zero)', () => {
    const isMoney = moneyRegexp.test('0')
    expect(isMoney).toBeTruthy()
  })

  it('should return true if it is tested with 0. (zero + comma)', () => {
    const isMoney = moneyRegexp.test('0.')
    expect(isMoney).toBeTruthy()
  })

  it('should return false if it is tested with more than 2 decimals', () => {
    const isMoney = moneyRegexp.test('1.234')
    expect(isMoney).toBeFalsy()
  })

  it('should return false if it is tested with a character', () => {
    const isMoney = moneyRegexp.test('345a')
    expect(isMoney).toBeFalsy()
  })

  it('should return false if it is tested with a special character', () => {
    const isMoney = moneyRegexp.test('345-')
    expect(isMoney).toBeFalsy()
  })

  it('should return false if it is tested with multiple 0 (zeros at the beginning)', () => {
    const isMoney = moneyRegexp.test('000123')
    expect(isMoney).toBeFalsy()
  })

  it('should return false if it is tested with multiple 0 (zeros)', () => {
    const isMoney = moneyRegexp.test('000')
    expect(isMoney).toBeFalsy()
  })

  it('should return false if it is tested with multiple 0 (zeros) leading a number', () => {
    const isMoney = moneyRegexp.test('000123')
    expect(isMoney).toBeFalsy()
  })
})

describe('Number With Commas', () => {
  it('should split thousands with a comma', () => {
    const amount = numberWithCommas('123456789')
    expect(amount).toEqual('123,456,789')
  })

  it('should return the same number if it is less than a 1000', () => {
    const amount = numberWithCommas('789')
    expect(amount).toEqual('789')
  })
})

describe('To mask', () => {
  it('should convert wei to masked value with decimals', () => {
    const wei = toMask(3451234)
    expect(wei).toEqual('3,451,234.00')
  })

  it('should convert wei to integer masked value', () => {
    const wei = toMask(3451200)
    expect(wei).toEqual('3,451,200.00')
  })

  it('should convert 0 to empty null', () => {
    const wei = toMask(0)
    expect(wei).toBeNull()
  })
})

describe('To raw value', () => {
  it('should convert masked value to number with decimals', () => {
    const amount = toRawValue('345,12.34', {})
    expect(amount).toEqual(34512.34)
  })

  it('should convert integer masked value to number', () => {
    const amount = toRawValue('345,12', {})
    expect(amount).toEqual(345.12)
  })

  it('should convert empty string to 0 (number)', () => {
    const amount = toRawValue('', {})
    expect(amount).toEqual(NaN)
  })
})

describe('Wei to GD', () => {
  it('should convert wei to gooddollars', () => {
    const wei = weiToGd('1234')
    expect(wei).toEqual('12.34')
  })

  it('should convert wei to gooddollars as integer value with decimals ', () => {
    const wei = weiToGd('1200')
    expect(wei).toEqual('12.00')
  })

  it('should convert 0 to empty string', () => {
    const wei = weiToGd('0')
    expect(wei).toEqual('0.00')
  })
})

describe('Wei to Mask', () => {
  it('should convert wei to masked value with decimals', () => {
    const wei = weiToMask(3451234)
    expect(wei).toEqual('34,512.34')
  })

  it('should convert wei to integer masked value', () => {
    const wei = weiToMask(3451200)
    expect(wei).toEqual('34,512.00')
  })

  it('should convert 0 to empty string', () => {
    const wei = weiToMask(0)
    expect(wei).toEqual('0.00')
  })
})
