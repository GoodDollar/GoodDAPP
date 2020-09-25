import { enhanceArgentinaCountryCode } from '../phoneNumber'

describe('phoneNumber', () => {
  it('should return the same phone number', () => {
    const nonARMobile = '+380500100500'
    const result = enhanceArgentinaCountryCode(nonARMobile)

    expect(result).toBe(nonARMobile)
  })

  it('should return enhanced phone number', () => {
    const arMobile = '+543624733805'
    const enhancedARMobile = '+5493624733805'
    const result = enhanceArgentinaCountryCode(arMobile)

    expect(result).toBe(enhancedARMobile)
  })
})
