/* eslint-disable no-undef */
class SocialLoginPage {
  get googleLink() {
    return cy.contains('Agree & Continue with Google')
  }

  get facebookLink() {
    return cy.contains(/Agree & Continue with Facebook/i)
  }
}

export default new SocialLoginPage()
