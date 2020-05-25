/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import SocialLoginPage from '../PageObjects/SocialLoginPage'

/*const { GoogleSocialLogin } = require('cypress-social-logins').plugins

module.exports = (on, config) => {
  on('task', {
    GoogleSocialLogin: GoogleSocialLogin
  })
}

describe('Login', () => {
  it('Login through Google', () => {
    const username = 'itltest122@gmail.com' //Cypress.env('googleSocialLoginUsername')
    const password = 'asdf1234Q!' //Cypress.env('googleSocialLoginPassword')
    const loginUrl = Cypress.env('baseUrl')
    const cookieName = '' //Cypress.env('cookieName')
    const socialLoginOptions = {
      username,
      password,
      loginUrl,
      headless: true,
      logs: false,
      loginSelector: 'a[href="/auth/auth0/google-oauth2"]',
      postLoginSelector: '.account-panel'
    }

    return cy.task('GoogleSocialLogin', socialLoginOptions).then(({ cookies }) => {
      cy.clearCookies()

      const cookie = cookies.filter(cookie => cookie.name === cookieName).pop()
      if (cookie) {
        cy.setCookie(cookie.name, cookie.value, {
          domain: cookie.domain,
          expiry: cookie.expires,
          httpOnly: cookie.httpOnly,
          path: cookie.path,
          secure: cookie.secure
        })

        Cypress.Cookies.defaults({
          whitelist: cookieName
        })
      }
    })
  })
})*/

describe('Test case 2.2: Socail Login', () => {
  it('login with Google', () => {
    // cy.visit('https://www.google.com/')
    // cy.get(
    //   'a[href="https://accounts.google.com/ServiceLogin?hl=uk&passive=true&continue=https://www.google.com/"]'
    // ).click()

    /*cy.visit('https://accounts.google.com/signin/v2/identifier?hl=uk&passive=true&continue=https%3A%2F%2Fwww.google.com%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin')

    cy.get('[type="email"]').type('itltest122@gmail.com')
    cy.get('#identifierNext').click()
    cy.get('type="password"').type('asdf1234Q!')
    cy.get('#passwordNext').click()*/
//"https://accounts.google.com/AccountChooser"
//"https://accounts.google.com/ServiceLogin?sacu=1&rip=1"

//cy.visit('https://accounts.google.com/AccountChooser')
//cy.visit('https://accounts.google.com/ServiceLogin?sacu=1&rip=1')
//cy.visit('https://accounts.google.com/ServiceLogin?service=mail&passive=true&rm=false&continue=https://mail.google.com/mail/&ss=1&scc=1&ltmpl=default&ltmplcache=2&emr=1&osid=1#')
//      cy.request('https://mail.google.com/mail/')

    StartPage.open()
    SocialLoginPage.googleLink.should('be.visible')
    SocialLoginPage.googleLink.click()
    // cy.request({
    //   method: 'POST',
    //   url: 'https://accounts.google.com/ServiceLogin?sacu=1&rip=1',
    //   body: {
    //     email: 'itltest122@gmail.com',
    //     password: 'asdf1234Q!',
    //   }
    // }).then(resp => {
    //   cy.log(resp)
    // })
    //cy.request('https://mail.google.com/mail/').get('[type="email"]').type('itltest122@gmail.com')

    // SocialLoginPage.googleLink.click().then(() => {
      cy.get('[type="email"]').type('itltest122@gmail.com')
      cy.get('#identifierNext').click()
      cy.get('type="password"').type('asdf1234Q!')
      cy.get('#passwordNext').click()
    // })

    //cy.get('#profileIdentifier').click()
  })
})
