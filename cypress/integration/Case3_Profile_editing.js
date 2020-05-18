/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import ProfilePage from '../PageObjects/ProfilePage'
import SignUpPage from '../PageObjects/SignUpPage'

function makeVerification() {
  EditProfilePage.waitForEditProfilePageDisplayed()
  cy.get('[role="button"]')
    .eq(2)
    .click()
  for (let i = 0; i < 6; i++) {
    SignUpPage.codeInputs.eq(i).type(i, { force: true }, { delay: 500 })
  }
  cy.contains('verification code').should('not.be.visible')
  ProfilePage.openEditProfileButton()
}

describe('Test case 3: Ability to change user data', () => {
  beforeEach('authorization', () => {
    cy.readFile('../GoodDAPP/cypress/fixtures/userMnemonicSave.txt').then(mnemonic => {
      StartPage.open()
      StartPage.signInButton.click()
      LoginPage.recoverFromPassPhraseLink.click()
      LoginPage.pageHeader.should('contain', 'Recover')
      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.waitForHomePageDisplayed()
    })
  })

  it('Elements are present at user profile', () => {
    HomePage.profileAvatar.should('be.visible')
    HomePage.sendButton.should('be.visible')
    HomePage.claimButton.should('be.visible')
    HomePage.receiveButton.should('be.visible')
    HomePage.optionsButton.click({ force: true })
    for (let i = 0; i < 8; i++) {
      HomePage.options.eq(i).should('be.visible')
    }
    HomePage.options.eq(0).click()
    ProfilePage.openEditProfileButton()
    EditProfilePage.pageHeader.should('contain', 'Edit Profile')
    EditProfilePage.nameInput.should('be.visible')
    EditProfilePage.phoneInput.should('be.visible')
    EditProfilePage.emailInput.should('be.visible')
    EditProfilePage.avatarDiv.should('be.visible')
  })

  it('User is able to upload avatar', () => {
    HomePage.profileAvatar.click()
    ProfilePage.avatarDiv.click({ multiple: true })
    ProfilePage.uploadUserAvatar()
    EditProfilePage.saveAvatarButton.click()
    EditProfilePage.uploadedAvatar.should('be.visible')
  })

  it.only('User is able to edit input fields', () => {
    HomePage.optionsButton.click({ force: true })
    HomePage.options.eq(0).click({ force: true })
    ProfilePage.openEditProfileButton()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.fillUserPhone('+380983611329')
    makeVerification()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.fillUserEmail('test123456@test.com')
    makeVerification()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.fillUserName('nickName888')
    cy.wait(1000)
    EditProfilePage.saveButton.click()
    EditProfilePage.saveButtonText.should('not.be.visible')
    ProfilePage.openProfilePage()

    //EditProfilePage.backButton.click();
    ProfilePage.nameInput.should('have.value', 'nickName888')
    ProfilePage.phoneInput.should('have.value', '+380983611329')
    ProfilePage.emailInput.should('have.value', 'test123456@test.com')

    // ** back to the default values ** //
    ProfilePage.openEditProfileButton()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.fillUserPhone('+380673001757')
    makeVerification()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.fillUserEmail('main.test.acc.gooddollar@gmail.com')
    makeVerification()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.fillUserName('TestAccount')
    EditProfilePage.saveButton.click()
    cy.contains('SAVE').should('not.be.visible')
    ProfilePage.pageHeader.should('contain', 'Profile')
  })

  it('User is unable to type invalid data', () => {
    HomePage.optionsButton.click({ force: true })
    HomePage.options.eq(0).click({ force: true })
    ProfilePage.pageHeader.should('contain', 'Profile')
    ProfilePage.openEditProfileButton()
    EditProfilePage.nameInput.invoke('attr', 'value').should('eq', 'UserName12345')
    EditProfilePage.nameInput.clear({ timeout: 10000 })
    EditProfilePage.nameInput.type('Random Username')
    cy.contains('Only letters, numbers and underscore')
    EditProfilePage.saveButton.should('not.be.enabled')
  })
})
