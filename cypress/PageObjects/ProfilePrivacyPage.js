/* eslint-disable no-undef */
class ProfilePrivacyPage {
  get pageHeader() {
    return cy.get('h1[role=heading]', { timeout: 10000 })
  }

  get publicNumberButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(3)
  }

  get publicEmailButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(6)
  }

  get muskedNumberButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(2)
  }

  get muskedEmailButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(5)
  }

  get privateNumberButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(1)
  }

  get privateEmailButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(4)
  }

  get backButton() {
    return cy.get('[role=button]', { timeout: 10000 }).contains('Cancel')
  }

  get saveButton() {
    return cy.get('[role=button]', { timeout: 10000 }).contains('Save')
  }

  get myFaceText() {
    return cy.contains('My Face Record ID')
  }

  get copyIdButton() {
    return cy.get('[dir="auto"]').contains('Copy ID')
  }

  get imgAvatar() {
    return cy.get('img[src*="data:image/png;base64"]')
  }
}

export default new ProfilePrivacyPage()
