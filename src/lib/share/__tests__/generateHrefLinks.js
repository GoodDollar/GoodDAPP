import { generateHrefLinks } from '../'

describe('generateHrefLinks', () => {
  it(`should return an array with one element for Email`, () => {
    // Given
    const to = 'john.doe@example.com'
    const sendLink = 'https://example.com/myLink'
    const text = `You got GD. To withdraw open: ${sendLink}`
    const viaEmail = { link: `mailto:${to}?subject=Sending GD via Good Dollar App&body=${text}`, description: 'e-mail' }

    // When
    const hrefLinks = generateHrefLinks(sendLink, to)

    // Then
    expect(hrefLinks.length).toBe(1)
    expect(hrefLinks[0]).toEqual(viaEmail)
  })

  it(`should return an array with one element for SMS`, () => {
    // Given
    const to = '+22222222222'
    const sendLink = 'https://example.com/myLink'
    const text = `You got GD. To withdraw open: ${sendLink}`
    const viaSMS = { link: `sms:${to}?body=${text}`, description: 'sms' }

    // When
    const hrefLinks = generateHrefLinks(sendLink, to)

    // Then
    expect(hrefLinks.length).toBe(1)
    expect(hrefLinks[0]).toEqual(viaSMS)
  })

  it(`it should return a collection of links for Email and SMS if no 'to' is provided`, () => {
    // Given
    const to = ''
    const sendLink = 'https://example.com/myLink'
    const text = `You got GD. To withdraw open: ${sendLink}`
    const viaEmail = { link: `mailto:${to}?subject=Sending GD via Good Dollar App&body=${text}`, description: 'e-mail' }
    const viaSMS = { link: `sms:${to}?body=${text}`, description: 'sms' }

    // When
    const hrefLinks = generateHrefLinks(sendLink)

    // Then
    expect(hrefLinks.length).toBe(2)
    expect(hrefLinks[0]).toEqual(viaEmail)
    expect(hrefLinks[1]).toEqual(viaSMS)
  })
})
