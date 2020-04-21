/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import 'cypress-localstorage-commands'

function checkValuesСorrectness(values, isCorrect) {
  LoginPage.recoverWalletButton.should('not.be.enabled')
  LoginPage.mnemonicsInput.type(values)
  LoginPage.recoverWalletButton.click()
  if (isCorrect) {
    LoginPage.yayButton.click()
    HomePage.profileAvatar.should('be.visible')
  } else {
    LoginPage.errorWindow.should('be.visible')
    cy.contains('Ok').click()
    LoginPage.mnemonicsInput.clear()
  }
}

describe('Test case 2: Ability to do authorization', () => {
  before(() => {
    const username = Cypress.env('googleSocialLoginUsername')
    const password = Cypress.env('googleSocialLoginPassword')
    const loginUrl = Cypress.env('loginUrl')
    const cookieName = Cypress.env('localStorageName')
    const socialLoginOptions = {
      username,
      password,
      loginUrl,
      headless: false,
      logs: false,
      isPopup: true,
      loginSelectorDelay: '5000',
      popupDelay: '5000',
      preLoginSelector:
        'div.css-1dbjc4n.r-14lw9ot.r-1f0042m.r-1l7z4oj.r-ymttw5.r-1yzf0co > div:nth-child(2) > div > div',
      loginSelector: 'div.css-1dbjc4n.r-14lw9ot.r-1f0042m.r-1l7z4oj.r-ymttw5.r-1yzf0co > div:nth-child(2) > div > div',
      postLoginSelector: 'img[alt]',
      getAllLocalStorage: true,
      cookieDelay: '25000',
    }

    return cy.task('GoogleSocialLogin', socialLoginOptions).then(({ cookies }) => {
      
      const cookie = cookies.filter(cookie => cookie.name === cookieName).pop()
      cy.log(cookie.name + ' Cookie Log')
      if (cookie) {
        cy.setCookie(cookie.name, cookie.value, {
          domain: cookie.domain,
          expiry: cookie.expires,
          httpOnly: cookie.httpOnly,
          path: cookie.path,
          secure: cookie.secure
        })
        cy.log(cookieName)
        Cypress.Cookies.defaults({
          whitelist: cookieName
        })
      }
    })
  })

  beforeEach(() => {
    cy.restoreLocalStorageCache()
  })

  it('User is not able to login with wrong values', () => {
    cy.visit('https://gooddev.netlify.com/AppNavigation/Profile/Profile')
    const wrongWords = Cypress.env('wordsForUnsuccessfullLogin')
    checkValuesСorrectness(wrongWords.withChangedWord, false)
    checkValuesСorrectness(wrongWords.withNumbers, false)
    checkValuesСorrectness(wrongWords.withSymbols, false)
    checkValuesСorrectness(wrongWords.withChangedLetter, false)
    checkValuesСorrectness(wrongWords.withChangedOrder, false)
    checkValuesСorrectness(wrongWords.withCapitalize, false)
  })

  it('User is able to login with correct values', () => {
    const wordsForSuccessfullLogin = Cypress.env('mainAccountMnemonics')
    checkValuesСorrectness(wordsForSuccessfullLogin, true)
  })
})
