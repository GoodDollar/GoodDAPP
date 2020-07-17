/* eslint-disable no-undef */
class SupportPage {
  get pageHeader() {
    return cy.get('[data-testid="rewards_header"]')
  }

  get iframe() {
    return cy.getIframeBody('iframe[title=" Help & Feedback"]')
  }

  get search() {
    return '#search'
  }

  get topics() {
    return '#topics'
  }

  get ask() {
    return '#ask-a-question'
  }

  get contactUs() {
    return '#link-contact-us'
  }

  get formSend() {
    return '#new_conversation'
  }
}

export default new SupportPage()
