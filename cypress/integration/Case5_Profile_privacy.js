/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import ProfilePage from '../PageObjects/ProfilePage'
import ProfilePrivacyPage from '../PageObjects/ProfilePrivacyPage'

describe('Test case 5: Ability to change profile privacy level', () => {
  before('authorization', () => {
    StartPage.open()
    StartPage.continueOnWebButton.click()
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    LoginPage.mnemonicsInput.type(Cypress.env('mainAccountMnemonics'))
    LoginPage.recoverWalletButton.click()
    LoginPage.yayButton.click()
  })

  it('User should be able to change privacy lvl', () => {
    HomePage.profileAvatar.should('be.visible')
    HomePage.profileAvatar.click()
    ProfilePage.phoneInput.should('have.value', '+380983611320')
    ProfilePage.emailInput.should('have.value', 'gooddollar.test123@gmail.com')
    ProfilePage.profilePrivacyButton.click()
    cy.wait(10000)
    ProfilePrivacyPage.pageHeader.should('contain', 'PROFILE PRIVACY')
    ProfilePrivacyPage.muskedNumberButton.click()
    cy.wait(5000)
    ProfilePrivacyPage.muskedEmailButton.click()
    cy.wait(5000)
    ProfilePrivacyPage.saveButton.click()
    cy.wait(10000)
    ProfilePrivacyPage.backButton.click()
    ProfilePage.phoneInput.should('have.value', '*********1320')
    ProfilePage.emailInput.should('have.value', 'g****************3@gmail.com')
    ProfilePage.profilePrivacyButton.click()
    cy.wait(10000)
    ProfilePrivacyPage.privateNumberButton.click()
    cy.wait(5000)
    ProfilePrivacyPage.privateEmailButton.click()
    cy.wait(5000)
    ProfilePrivacyPage.saveButton.click()
    cy.wait(5000)
    ProfilePrivacyPage.backButton.click()
    ProfilePage.phoneInput.should('have.value', '******')
    ProfilePage.emailInput.should('have.value', '******')
    ProfilePage.profilePrivacyButton.click()
    ProfilePrivacyPage.publicNumberButton.click()
    cy.wait(5000)
    ProfilePrivacyPage.publicEmailButton.click()
    cy.wait(5000)
    ProfilePrivacyPage.saveButton.click()
    cy.wait(7000)
  })
})
