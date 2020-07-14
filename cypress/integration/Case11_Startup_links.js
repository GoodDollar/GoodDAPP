/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'

describe('Test case 11: Test Terms of Use and Privacy Policy links', () => {
  it('"Terms of Use" link', () => {
    localStorage.clear()
    StartPage.open()
    StartPage.headerPage.should('contain', 'Welcome')
    StartPage.termsOfUseLink.click()
    StartPage.headerPage.should('be.visible').contains('Privacy Policy & Terms')
    StartPage.iframePPT.find(StartPage.main).should('be.visible')
    StartPage.iframePPT
      .find(StartPage.main)
      .find('.av-tab-section-outer-container')
      .should('be.visible')
    StartPage.iframePPT
      .find(StartPage.main)
      .find('.av-tab-section-tab-title-container')
      .should('be.visible')
    StartPage.iframePPT
      .find(StartPage.main)
      .find('.av-tab-section-tab-title-container')
      .and('contain', 'GoodDollar Terms of Use')
      .and('contain', 'Privacy Policy')
      .and('contain', 'Demo Agreement')
      .should('be.visible')

    StartPage.iframePPT.contains('Terms of Use & Pilot Agreement')
    StartPage.iframePPT.contains('Last Updated')
    StartPage.iframePPT.contains('1. INFORMATION ABOUT US')
    StartPage.iframePPT.contains('21. RISK FACTORS')
    StartPage.iframePPT.contains('23. TRADE MARKS')

    StartPage.backArrow.click()
  })

  it('"Privacy Policy" link', () => {
    StartPage.headerPage.should('contain', 'Welcome')
    StartPage.privacyPolicyLink.click()
    StartPage.headerPage.should('be.visible').contains('Privacy Policy')
    StartPage.iframePP.find(StartPage.main).should('be.visible')
    StartPage.iframePP
      .find(StartPage.main)
      .find('.av-tab-section-outer-container')
      .should('be.visible')
    StartPage.iframePP
      .find(StartPage.main)
      .find('.av-tab-section-tab-title-container')
      .and('contain', 'GoodDollar Terms of Use')
      .and('contain', 'Privacy Policy')
      .and('contain', 'Demo Agreement')
      .should('be.visible')

    StartPage.iframePP.contains('Terms of Use & Pilot Agreement')
    StartPage.iframePP.contains('GoodDollar Personal Data Protection Policy and Cookies Policy')
    StartPage.iframePP.contains('1. General principles')
    StartPage.iframePP.contains('Cookies Policy')
    StartPage.iframePP.contains('17. Any questions?')

    StartPage.backArrow.click()

    StartPage.headerPage.should('contain', 'Welcome')
  })
})
