/* eslint-disable no-undef */
class ProfilePrivacyPage {
  get backButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(0)
  }

  get pageHeader() {
    return cy.get('h1[role=heading]', { timeout: 10000 })
  }

  get publicNumberButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(4)
  }

  get publicEmailButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(7)
  }

  get muskedNumberButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(3)
  }

  get muskedEmailButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(6)
  }

  get privateNumberButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(2)
  }

  get privateEmailButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(5)
  }

  get saveButton() {
    return cy.get('[role=button]', { timeout: 10000 }).eq(9)
  }
}

export default new ProfilePrivacyPage()
