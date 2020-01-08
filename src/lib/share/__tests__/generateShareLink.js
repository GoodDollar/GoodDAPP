import { generateShareLink } from '../'
import Config from '../../../config/config'

describe('generateShareLink', () => {
  it(`should fail if action has an invalid value`, () => {
    // Given
    const action = 'share'
    const params = {
      key: 'value',
    }

    // When
    const erroredFunction = () => generateShareLink(action, params)

    // Then
    expect(erroredFunction).toThrowError(`Link couldn't be generated`)
  })

  it(`should fail if params is an empty object`, () => {
    // Given
    const action = 'send'
    const params = {}

    // When
    const erroredFunction = () => generateShareLink(action, params)

    // Then
    expect(erroredFunction).toThrowError(`Link couldn't be generated`)
  })

  it(`should fail if no params are provided`, () => {
    // When
    const erroredFunction = () => generateShareLink()

    // Then
    expect(erroredFunction).toThrowError(`Link couldn't be generated`)
  })

  it(`should return link generated from send action`, () => {
    // Given
    const action = 'send'
    const params = {
      key: 'value',
    }
    let paramsBase64 = Buffer.from(JSON.stringify(params)).toString('base64')

    // When
    const link = generateShareLink(action, params)

    // Then
    expect(link).toEqual(`${Config.sendUrl}?paymentCode=${paramsBase64}`)
  })

  it(`should return link generated from receive action`, () => {
    // Given
    const action = 'receive'
    const params = {
      key: 'value',
    }
    let paramsBase64 = Buffer.from(JSON.stringify(params)).toString('base64')

    // When
    const link = generateShareLink(action, params)

    // Then
    expect(link).toEqual(`${Config.receiveUrl}?code=${paramsBase64}`)
  })

  it(`should return link generated from send action, with several query params`, () => {
    // Given
    const action = 'send'
    const params = {
      key: 'value',
      key2: 'value2',
      key3: 'value3',
      key4: 'value4',
    }
    let paramsBase64 = Buffer.from(JSON.stringify(params)).toString('base64')

    // When
    const link = generateShareLink(action, params)

    // Then
    expect(link).toEqual(`${Config.sendUrl}?paymentCode=${paramsBase64}`)
  })

  it(`should return link generated from send action, with several query params`, () => {
    // Given
    const action = 'receive'
    const params = {
      key: 'value',
      key2: 'value2',
      key3: 'value3',
      key4: 'value4',
    }
    let paramsBase64 = Buffer.from(JSON.stringify(params)).toString('base64')

    // When
    const link = generateShareLink(action, params)

    // Then
    expect(link).toEqual(`${Config.receiveUrl}?code=${paramsBase64}`)
  })

  it(`should return link generated from send action, with encoded query param`, () => {
    // Given
    const action = 'send'
    const params = { key: 'value with spaces' }
    let paramsBase64 = Buffer.from(JSON.stringify(params)).toString('base64')

    // When
    const link = generateShareLink(action, params)

    // Then
    expect(link).toEqual(`${Config.sendUrl}?paymentCode=${paramsBase64}`)
  })
})
