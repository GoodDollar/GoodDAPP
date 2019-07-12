import { generateHrefLink } from '..'

describe('generateHrefLink', () => {
  it(`should return an element for Email`, () => {
    // Given
    const to = 'john.doe@example.com'
    const url = 'https://example.com/myLink'
    const title = 'Sending G$ via Good Dollar App'
    const shareObj = {
      title,
      text: 'You got G$. To withdraw open:',
      url,
    }
    const viaEmail = {
      link: `mailto:${to}?subject=${title}&body=You got G$. To withdraw open:\n${url}`,
      description: 'e-mail',
    }

    // When
    const hrefLink = generateHrefLink(shareObj, to)

    // Then
    expect(hrefLink).toEqual(viaEmail)
  })

  it(`should return an element for SMS`, () => {
    // Given
    const to = '+22222222222'
    const url = 'https://example.com/myLink'
    const shareObj = {
      text: 'You got G$. To withdraw open:',
      url,
    }
    const viaSMS = { link: `sms:${to}?body=You got G$. To withdraw open:\n${url}`, description: 'sms' }

    // When
    const hrefLink = generateHrefLink(shareObj, to)

    // Then
    expect(hrefLink).toEqual(viaSMS)
  })

  it(`it should return undefined if no to is provided`, () => {
    // Given
    const sendLink = 'https://example.com/myLink'

    // When
    const hrefLink = generateHrefLink(sendLink)

    // Then
    expect(hrefLink).toBeUndefined()
  })
})
