/* eslint-disable no-undef */
class EditProfilePage {
  get nameInput() {
    return cy.get('input[placeholder="Choose a Username"]', { timeout: 10000 })
  }

  get phoneInput() {
    return cy.get('#signup_phone', { timeout: 10000 })
  }

  get emailInput() {
    return cy.get('input[placeholder="Add your Email"]', { timeout: 10000 })
  }

  get backButton() {
    return cy.get('[role="button"]').eq(0)
  }

  get avatarDiv() {
    return cy.get('[data-focusable=true]', { timeout: 10000 }).eq(2)
  }

  get saveButton() {
    return cy.get('[role="button"]').eq(2)
  }

  get pageHeader() {
    return cy.get('h1[role=heading]', { timeout: 10000 })
  }

  get saveAvatarButton() {
    return cy.contains('Save')
  }

  get clearAvatarButton() {
    return cy.get('[dir="auto"]').eq(4)
  }

  get uploadedAvatar() {
    return cy.get('img[src*=data]', { timeout: 10000 })
  }

  get wrongEmailErrorDiv() {
    return cy.xpath('//*[@id="root"]/div[1]/div/div/div/div[2]/div/div/div/div[2]/div/div/div[1]/div/div[2]', {
      timeout: 10000,
    })
  }

  waitForEditProfilePageDisplayed() {
    cy.contains('Edit Profile').should('be.visible')
  }

  fillUserPhone(phoneNumber) {
    const phoneInput = cy.get('#signup_phone', { timeout: 10000 }).should('contains.value', '+38')
    phoneInput.focus().clear(), { timeout: 1000 }
    phoneInput.clear().type(phoneNumber), { delay: 400 }
    phoneInput.focus().blur()
  }

  fillUserEmail(userEmail) {
    const emailInput = cy.get('input[placeholder="Add your Email"]', { timeout: 10000 }).should('contains.value', 'com')
    emailInput.focus().clear(), { timeout: 1000 }
    emailInput.clear().type(userEmail), { delay: 400 }
    emailInput.focus().blur()
  }

  fillUserName(userName) {
    const nameInput = cy
      .get('input[placeholder="Choose a Username"]', { timeout: 10000 })
      .should('contains.value', 'And')
    nameInput.focus().clear(), { timeout: 1000 }
    nameInput.clear().type(userName), { delay: 400 }
    nameInput.focus().blur()
  }
}

export default new EditProfilePage()
