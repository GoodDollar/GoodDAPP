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
    .eq(3)
    .click()
  for (let i = 0; i < 6; i++) {
    SignUpPage.codeInputs.eq(i).type(i, { force: true }, { delay: 500 })
  }
  cy.contains('verification code').should('not.be.visible')
  ProfilePage.openEditProfileButton()
}

describe('Test case 3: Ability to change user data', () => {
  beforeEach('authorization', () => {
    StartPage.open()
    StartPage.continueOnWebButton.click()
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    LoginPage.mnemonicsInput.type(Cypress.env('mainAccountMnemonics'))
    LoginPage.recoverWalletButton.click()
    LoginPage.yayButton.click()
    HomePage.waitForHomePageDisplayed()
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
    EditProfilePage.saveButton.should('be.visible')
  })

  it('User is able to upload avatar', () => {
    HomePage.profileAvatar.click()
    ProfilePage.avatarDiv.click({ multiple: true })
    ProfilePage.uploadUserAvatar()
    EditProfilePage.saveAvatarButton.click()
    EditProfilePage.uploadedAvatar.should('be.visible')
  })

  it('User is able to edit input fields', () => {
    // ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~//
    // before running make sure current fields values correspond to defaults   //
    // ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~//
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
    EditProfilePage.fillUserName('AndrewGolenkov1234')
    EditProfilePage.saveButton.should('have.attr', 'data-focusable')
    EditProfilePage.saveButton.click()
    cy.contains('Save').should('not.be.visible')
    ProfilePage.openProfilePage()

    //EditProfilePage.backButton.click();
    ProfilePage.nameInput.should('have.value', 'AndrewGolenkov1234')
    ProfilePage.phoneInput.should('have.value', '+380983611329')
    ProfilePage.emailInput.should('have.value', 'test123456@test.com')

    // ** back to the default values ** //
    ProfilePage.openEditProfileButton()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.fillUserPhone('+380983611327')
    makeVerification()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.fillUserEmail('gooddollar.test123@gmail.com')
    makeVerification()
    EditProfilePage.waitForEditProfilePageDisplayed()
    EditProfilePage.fillUserName('AndrewLebowski1234')
    EditProfilePage.saveButton.should('have.attr', 'data-focusable')
    EditProfilePage.saveButton.click()
    cy.contains('Save').should('not.be.visible')

    //EditProfilePage.backButton.click();
    ProfilePage.pageHeader.should('contain', 'Profile')
  })

  it('User is unable to type invalid data', () => {
    HomePage.optionsButton.click({ force: true })
    HomePage.options.eq(0).click({ force: true })
    ProfilePage.pageHeader.should('contain', 'Profile')

    // ProfilePage.editProfileButton.click()
    ProfilePage.openEditProfileButton()
    EditProfilePage.nameInput.invoke('attr', 'value').should('eq', 'AndrewLebowski1234')

    // ProfilePage.editProfileButton.should('be.visible');
    // ProfilePage.editProfileButton.click();
    EditProfilePage.nameInput.clear({ timeout: 10000 })

    // EditProfilePage.phoneInput.clear({timeout:10000});
    // EditProfilePage.emailInput.clear({timeout:10000});
    EditProfilePage.nameInput.type('Random Username')

    // EditProfilePage.phoneInput.type('+999999999999')
    // EditProfilePage.emailInput.type('incorrect@email')
    cy.contains('Only letters, numbers and underscore')

    // EditProfilePage.phoneInput.should('have.class', 'react-phone-number-input__input--invalid')
    // EditProfilePage.wrongEmailErrorDiv.should('contain', 'Enter a valid format: yourname@example.com');
    EditProfilePage.saveButton.should('not.be.enabled')
  })
})
