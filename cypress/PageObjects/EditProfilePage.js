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
    return cy.contains('Save')
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

  get wrongNameErrorDiv() {
    return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div/div[2]/div/div/div[1]/div/div[2]', {
      timeout: 10000,
    })
  }

  get wrongEmailErrorDiv() {
    return cy.xpath('//*[@id="root"]/div[1]/div/div/div[2]/div[2]/div/div/div/div[2]/div/div/div[3]/div/div[2]', {
      timeout: 10000,
    })
  }
}

export default new EditProfilePage()
