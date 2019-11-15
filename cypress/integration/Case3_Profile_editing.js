/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import ProfilePage from '../PageObjects/ProfilePage'
import SignUpPage from '../PageObjects/SignUpPage'

function makeVerification() {
  cy.wait(10000)
  cy.get('[role="button"]')
    .eq(3)
    .click()
  for (let i = 0; i < 6; i++) {
    cy.wait(2000)
    SignUpPage.codeInputs.eq(i).type(i, { force: true })
  }
  cy.wait(5000)
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
    cy.wait(7000)
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
    const selector = 'input[type="file"]'
    const fixturePath = 'smile.png'
    const type = 'image/png'
    cy.get(selector)
      .eq(0)
      .then(subject =>
        cy.window().then(win =>
          cy
            .fixture(fixturePath, 'base64')
            .then(Cypress.Blob.base64StringToBlob)
            .then(blob => {
              const el = subject[0]
              const testFile = new win.File([blob], name, { type })
              const dataTransfer = new win.DataTransfer()
              dataTransfer.items.add(testFile)
              el.files = dataTransfer.files
              cy.wrap(subject).trigger('change', { force: true })
            })
        )
      )
    cy.wait(8000)
    EditProfilePage.saveAvatarButton.click()

    //EditProfilePage.saveAvatarButton.click();
    EditProfilePage.uploadedAvatar.should('be.visible')
    EditProfilePage.clearAvatarButton.click()
    cy.wait(8000)
  })

  it('User is able to edit input fields', () => {
    HomePage.optionsButton.click({ force: true })
    HomePage.options.eq(0).click({ force: true })
    ProfilePage.openEditProfileButton()
    EditProfilePage.phoneInput.clear()
    EditProfilePage.phoneInput.type('+380983611329')
    EditProfilePage.phoneInput.blur()
    makeVerification()

    EditProfilePage.emailInput.clear()
    EditProfilePage.emailInput.type('test123456@test.com')
    EditProfilePage.emailInput.blur()
    makeVerification()
    EditProfilePage.nameInput.clear()
    EditProfilePage.nameInput.type('AndrewGolenkov123')
    cy.wait(5000)
    EditProfilePage.saveButton.click()
    cy.wait(5000)
    ProfilePage.openProfilePage()
    cy.wait(5000)

    //EditProfilePage.backButton.click();
    ProfilePage.nameInput.should('have.value', 'AndrewGolenkov123')
    ProfilePage.phoneInput.should('have.value', '+380983611329')
    ProfilePage.emailInput.should('have.value', 'test123456@test.com')

    // ** back to the default values ** //
    ProfilePage.openEditProfileButton()
    cy.wait(3000)
    EditProfilePage.phoneInput.clear()
    EditProfilePage.phoneInput.type('+380983611327')
    EditProfilePage.phoneInput.blur()
    makeVerification()
    EditProfilePage.emailInput.clear()
    EditProfilePage.emailInput.type('gooddollar.test123@gmail.com')
    EditProfilePage.emailInput.blur()
    makeVerification()
    EditProfilePage.nameInput.clear()
    EditProfilePage.nameInput.type('AndrewLebowski123')
    cy.wait(5000)
    EditProfilePage.saveButton.click()
    cy.wait(5000)

    //EditProfilePage.backButton.click();
    ProfilePage.pageHeader.should('contain', 'Profile')
  })

  it('User is unable to type invalid data', () => {
    HomePage.optionsButton.click({ force: true })
    HomePage.options.eq(0).click({ force: true })
    ProfilePage.openEditProfileButton()

    // ProfilePage.editProfileButton.should('be.visible');
    // ProfilePage.editProfileButton.click();
    EditProfilePage.nameInput.clear({ timeout: 10000 })

    // EditProfilePage.phoneInput.clear({timeout:10000});
    // EditProfilePage.emailInput.clear({timeout:10000});
    EditProfilePage.nameInput.type('Random Username')

    // EditProfilePage.phoneInput.type('+999999999999');
    // EditProfilePage.emailInput.type('incorrect@email');
    EditProfilePage.wrongNameErrorDiv.should('contain', 'Only letters, numbers and underscore')

    // EditProfilePage.phoneInput.should('have.class', 'react-phone-number-input__input--invalid')
    // EditProfilePage.wrongEmailErrorDiv.should('contain', 'Enter a valid format: yourname@example.com');
    EditProfilePage.saveButton.should('not.be.enabled')
  })
})
