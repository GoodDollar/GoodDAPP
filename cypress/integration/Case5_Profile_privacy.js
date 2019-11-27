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
    HomePage.waitForHomePageDisplayed()
    HomePage.profileAvatar.should('be.visible')
    HomePage.profileAvatar.click()
    ProfilePage.profilePrivacyButton.click()
    ProfilePrivacyPage.publicNumberButton.click()
    ProfilePrivacyPage.publicEmailButton.click()
    ProfilePrivacyPage.saveButton.click()
    ProfilePrivacyPage.backButton.click()
    ProfilePage.phoneInput.should('have.value', '+380983611327')
    ProfilePage.emailInput.should('have.value', 'gooddollar.test123@gmail.com')
    ProfilePage.profilePrivacyButton.click()
    ProfilePrivacyPage.pageHeader.should('contain', 'PROFILE PRIVACY')
    ProfilePrivacyPage.muskedNumberButton.click()
    ProfilePrivacyPage.muskedEmailButton.click()
    ProfilePrivacyPage.saveButton.click()
    ProfilePrivacyPage.backButton.click()
    ProfilePage.phoneInput.should('have.value', '*********1327')
    ProfilePage.emailInput.should('have.value', 'g****************3@gmail.com')
    ProfilePage.profilePrivacyButton.click()
    ProfilePrivacyPage.privateNumberButton.click()
    ProfilePrivacyPage.privateEmailButton.click()
    ProfilePrivacyPage.saveButton.click()
    ProfilePrivacyPage.backButton.click()
    ProfilePage.phoneInput.should('have.value', '******')
    ProfilePage.emailInput.should('have.value', '******')
    ProfilePage.profilePrivacyButton.click()
    ProfilePrivacyPage.publicNumberButton.click()
    ProfilePrivacyPage.publicEmailButton.click()
    ProfilePrivacyPage.saveButton.click()
  })
})
