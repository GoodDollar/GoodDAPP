/* eslint-disable no-undef */
//import LoginPage from '../PageObjects/LoginPage'
import StartPage from '../PageObjects/StartPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import ProfilePage from '../PageObjects/ProfilePage'
import SignUpPage from '../PageObjects/SignUpPage'
import GDls from '../fixtures/GDls.json'
import ProfilePrivacyPage from '../PageObjects/ProfilePrivacyPage'

function makeVerification() {
  EditProfilePage.waitForEditProfilePageDisplayed()
  cy.get('[role="button"]')
    .eq(2)
    .click()
  for (let i = 0; i < 6; i++) {
    SignUpPage.codeInputs.eq(i).type(i, { delay: 500 })
  }
  cy.contains('verification code').should('not.be.visible')
  ProfilePage.editButton.click()
  //ProfilePage.openEditProfileButton()
}

describe('Test case 5: Ability to change user data', () => {
/*  beforeEach('authorization', () => {
    localStorage.clear()
    cy.readFile('cypress/fixtures/userMnemonicSave.txt').then(mnemonic => {
      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.waitForHomePageDisplayed()
    })

    localStorage.setItem('GD_mnemonic', JSON.stringify(GDls.GD_mnemonic))
    localStorage.setItem('GD_isLoggedIn', JSON.stringify(GDls.GD_isLoggedIn))
    StartPage.open()
    expect(localStorage.getItem('GD_mnemonic')).to.not.be.null
    expect(localStorage.getItem('GD_isLoggedIn')).to.not.be.null
  })*/
  before('load localStorage', () => {
    localStorage.clear()
    Object.keys(GDls).forEach(key => {
      localStorage.setItem(key, GDls[key])
    })
    StartPage.open()
  })

  it('Elements are present at user profile', () => {
    HomePage.sendButton.should('be.visible')
    HomePage.claimButton.should('be.visible')
    HomePage.receiveButton.should('be.visible')
    HomePage.profileAvatar.should('be.visible')
    HomePage.optionsButton.click({ force: true })
    for (let i = 0; i < 8; i++) {
      HomePage.options.eq(i).should('be.visible')
    }
    HomePage.options.eq(0).click()
    ProfilePage.editButton.click()
    //ProfilePage.openEditProfileButton()
    EditProfilePage.pageHeader.should('contain', 'Edit Profile')
    EditProfilePage.nameInput.should('be.visible')
    EditProfilePage.phoneInput.should('be.visible')
    EditProfilePage.emailInput.should('be.visible')
    EditProfilePage.avatarDiv.should('be.visible')
    HomePage.backArrow.eq(0).click()
    ProfilePage.pageHeader.should('contain', 'Profile')
    HomePage.backArrow.eq(0).click()
  })

  it('User is able to upload avatar', () => {
    HomePage.sendButton.should('be.visible')
    HomePage.profileAvatar.click()
    ProfilePage.avatarDiv.click({ multiple: true })
    ProfilePage.uploadUserAvatar()
    EditProfilePage.saveAvatarButton.click()
    EditProfilePage.uploadedAvatar.should('be.visible')
    HomePage.backArrow.eq(0).click()
    ProfilePage.pageHeader.should('contain', 'Profile')
    HomePage.backArrow.eq(0).click()
  })

  it('Check profile image in Privacy page after upload avatar', () => {
    HomePage.profileAvatar.should('be.visible')
    HomePage.profileAvatar.click()
    ProfilePage.profilePrivacyButton.click()
    ProfilePrivacyPage.pageHeader.should('contain', 'PROFILE PRIVACY')
    ProfilePrivacyPage.imgAvatar.should('be.visible')
    HomePage.backArrow.eq(0).click()
    HomePage.backArrow.eq(0).click()
  })

  it('User is able to edit input fields', () => {
    HomePage.sendButton.should('be.visible')
    HomePage.optionsButton.click({ force: true })
    HomePage.options.eq(0).click({ force: true })
    ProfilePage.pageHeader.should('contain', 'Profile')
    //ProfilePage.openEditProfileButton()
    ProfilePage.editButton.click()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.phoneInput.should('be.visible')
    EditProfilePage.fillUserPhone('+380983611329')
    makeVerification()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.emailInput.should('be.visible')
    EditProfilePage.fillUserEmail('test123456@test.com')
    makeVerification()
    EditProfilePage.waitForEditProfilePageDisplayed()
    HomePage.backArrow.eq(0).click()
    ProfilePage.pageHeader.should('contain', 'Profile')
    ProfilePage.phoneInput.should('have.value', '+380983611329')
    ProfilePage.emailInput.should('have.value', 'test123456@test.com')
    // HomePage.backArrow.eq(0).click()

    // ** back to the default values ** //
    //ProfilePage.openEditProfileButton()
    ProfilePage.editButton.click()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.phoneInput.should('be.visible')
    EditProfilePage.fillUserPhone('+380673001757')
    makeVerification()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.emailInput.should('be.visible')
    EditProfilePage.fillUserEmail('gooddollar.test@gmail.com')
    makeVerification()
    EditProfilePage.waitForEditProfilePageDisplayed()
    HomePage.backArrow.eq(0).click()
    ProfilePage.pageHeader.should('contain', 'Profile')
    HomePage.backArrow.eq(0).click()
  })

  it('User is unable to type invalid data', () => {
    HomePage.sendButton.should('be.visible')
    HomePage.optionsButton.click({ force: true })
    HomePage.options.eq(0).click({ force: true })
    ProfilePage.pageHeader.should('contain', 'Profile')
    ProfilePage.editButton.click()
    EditProfilePage.nameInput.type('Random Username')
    EditProfilePage.phoneInput.should('be.visible')
    EditProfilePage.emailInput.should('be.visible')
    EditProfilePage.phoneInput.click()
    EditProfilePage.emailInput.click()
    cy.contains('Only letters, numbers and underscore')
    EditProfilePage.saveButton.should('not.be.enabled')
  })
})
