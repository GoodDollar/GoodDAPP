/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'

function typeInputValues(values, isCorrect) {
  LoginPage.recoverWalletButton.should('not.be.enabled')
  const string = values.join(' ')
  LoginPage.mnemonicsInput.type(string)
  LoginPage.recoverWalletButton.click()
  if (isCorrect) {
    LoginPage.recoverWalletButton.click({ force: true })
    LoginPage.yayButton.click()
    cy.wait(10000)
    HomePage.profileAvatar.should('be.visible')

    cy.request(
      'POST',
      'https://explorer.fusenet.io/api/?module=account&action=balance&address=0x014eC1481B12DB5f9AC8A0f98d4af160cFd20167'
    ).then(res => {
      cy.log(res)
    })
  } else {
    LoginPage.errorWindow.should('be.visible')
    cy.contains('Ok').click()
    LoginPage.mnemonicsInput.clear()
  }
}

describe('Test case 2: Ability to do authorization', () => {
  beforeEach(() => {
    StartPage.open()
    StartPage.continueOnWebButton.click()
    StartPage.createWalletButton.should('be.visible')
    StartPage.signInButton.should('be.visible')
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    LoginPage.mnemonicsInput.should('be.visible')
  })

  it('User is not able to login with wrong values', () => {
    const wrongWords = Cypress.env('wordsForUnsuccessfullLogin')
    typeInputValues(wrongWords.withChangedWord, false)
    typeInputValues(wrongWords.withNumbers, false)
    typeInputValues(wrongWords.withSymbols, false)
    typeInputValues(wrongWords.withChangedLetter, false)
    typeInputValues(wrongWords.withChangedOrder, false)
    typeInputValues(wrongWords.withCapitalize, false)
  })

  it('User is able to login with correct values', () => {
    const wordsForSuccessfullLogin = Cypress.env('wordsForSuccessfullLogin')
    typeInputValues(wordsForSuccessfullLogin, true)
  })
})
