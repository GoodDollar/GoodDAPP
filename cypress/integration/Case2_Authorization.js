/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'

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
  beforeEach(() => {
    StartPage.open()
    StartPage.continueOnWebButton.click()
    StartPage.signInButton.should('be.visible')
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    LoginPage.mnemonicsInput.should('be.visible')
  })

  it('User is not able to login with wrong values', () => {
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
