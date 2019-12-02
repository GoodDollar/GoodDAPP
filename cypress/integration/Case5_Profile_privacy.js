/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import ProfilePage from '../PageObjects/ProfilePage'
import ProfilePrivacyPage from '../PageObjects/ProfilePrivacyPage'

describe('Test case 5: Ability to change profile privacy level', () => {
  it.only('User should be able to change privacy lvl', () => {
    StartPage.open()
    StartPage.continueOnWebButton.click()
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    LoginPage.mnemonicsInput.type(Cypress.env('additionalAccountMnemonics'))
    LoginPage.recoverWalletButton.click()
    LoginPage.yayButton.click()
    HomePage.waitForHomePageDisplayed()
    HomePage.profileAvatar.should('be.visible')
    HomePage.profileAvatar.click()
    ProfilePage.profilePrivacyButton.click()
    ProfilePrivacyPage.publicNumberButton.click()
    ProfilePrivacyPage.publicEmailButton.click()

    // it checks if radiobutton is chosen (if it has 3 elements nested into each other)
    ProfilePrivacyPage.publicNumberButton
      .children()
      .children()
      .children()
      .should('be.visible')
    ProfilePrivacyPage.publicEmailButton
      .children()
      .children()
      .children()
      .should('be.visible')
    ProfilePrivacyPage.saveButton.click()
    ProfilePrivacyPage.backButton.click()
    ProfilePage.phoneInput.should('have.value', '+529881238235')
    ProfilePage.emailInput.should('have.value', 'gooddollar.2test123@gmail.com')
    ProfilePage.profilePrivacyButton.click()
    ProfilePrivacyPage.pageHeader.should('contain', 'PROFILE PRIVACY')
    ProfilePrivacyPage.muskedNumberButton.click()
    ProfilePrivacyPage.muskedEmailButton.click()
    ProfilePrivacyPage.muskedNumberButton
      .children()
      .children()
      .children()
      .should('be.visible')
    ProfilePrivacyPage.muskedEmailButton
      .children()
      .children()
      .children()
      .should('be.visible')
    ProfilePrivacyPage.saveButton.click()
    ProfilePrivacyPage.backButton.click()
    ProfilePage.phoneInput.should('have.value', '*********8235')
    ProfilePage.emailInput.should('have.value', 'g*****************3@gmail.com')
    ProfilePage.profilePrivacyButton.click()
    ProfilePrivacyPage.privateNumberButton.click()
    ProfilePrivacyPage.privateEmailButton.click()
    ProfilePrivacyPage.privateNumberButton
      .children()
      .children()
      .children()
      .should('be.visible')
    ProfilePrivacyPage.privateEmailButton
      .children()
      .children()
      .children()
      .should('be.visible')
    ProfilePrivacyPage.saveButton.click()
    ProfilePrivacyPage.backButton.click()
    ProfilePage.phoneInput.should('have.value', '******')
    ProfilePage.emailInput.should('have.value', '******')

    // ProfilePage.profilePrivacyButton.click()
    // ProfilePrivacyPage.publicNumberButton.click()
    // ProfilePrivacyPage.publicEmailButton.click()
    // ProfilePrivacyPage.saveButton.click()
  })
})
