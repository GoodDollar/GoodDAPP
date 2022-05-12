import { parsePaymentLinkParams } from '../'

describe('Decode old', () => {
  it(`decode old format, full params`, () => {
    // Given
    const params = {
      paymentCode: 'paymentCode',
      reason: 'test',
    }

    const decoded = parsePaymentLinkParams(params)

    // Then
    expect(decoded).toEqual(params)
  })

  it(`decode old format, full params, other params `, () => {
    // Given
    const params = {
      paymentCode: 'paymentCode',
      reason: 'test',
    }
    const otherParams = {
      other1: 'other 1',
      code: 'code_code',
    }
    const decoded = parsePaymentLinkParams({ ...params, ...otherParams })

    // Then
    expect(decoded).toEqual(params)
  })

  it(`decode old format, only paymentCode, other params `, () => {
    // Given
    const params = {
      paymentCode: 'paymentCode',
    }
    const otherParams = {
      other1: 'other 1',
      code: 'code_code',
    }
    const decoded = parsePaymentLinkParams({ ...params, ...otherParams })

    // Then
    expect(decoded).toEqual({ ...params, reason: null })
  })

  it(`decode old format, bad params `, () => {
    // Given
    const otherParams = {
      other1: 'other 1',
      code: 'code_code',
    }
    const decoded = parsePaymentLinkParams({ ...otherParams })

    // Then
    expect(decoded).toEqual(null)
  })
})

describe('Decode base64', () => {
  it(`base54, full params`, () => {
    // Given
    const params = {
      paymentCode: 'paymentCode',
      reason: 'test',
    }
    const code = Buffer.from(JSON.stringify(params))
      .toString('base64')
      .replace(/=+$/, '')
    const decoded = parsePaymentLinkParams({ paymentCode: code })

    // Then
    expect(decoded).toEqual(params)
  })

  it(`base54, full params, other params `, () => {
    // Given
    const params = {
      paymentCode: 'paymentCode',
      reason: 'test',
    }
    const otherParams = {
      other1: 'other 1',
      code: 'code_code',
    }

    const code = Buffer.from(JSON.stringify(params))
      .toString('base64')
      .replace(/=+$/, '')
    const decoded = parsePaymentLinkParams({ paymentCode: code, ...otherParams })

    expect(decoded).toEqual(params)
  })

  it(`base54 format, only paymentCode, other params `, () => {
    // Given
    const params = {
      paymentCode: 'paymentCode',
      reason: null,
    }
    const otherParams = {
      other1: 'other 1',
      code: 'code_code',
    }
    const code = Buffer.from(JSON.stringify(params))
      .toString('base64')
      .replace(/=+$/, '')

    const decoded = parsePaymentLinkParams({ paymentCode: code, ...otherParams })

    // Then
    expect(decoded).toEqual(params)
  })
})
