/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import SupportPage from '../PageObjects/SupportPage'
import InvitePage from '../PageObjects/InvitePage'

describe('Test case 4: Check topbar items functionality', () => {
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

  it('Check is items are displayed at topbar', () => {
    HomePage.inviteTab.should('be.visible')
    HomePage.goodmarketTab.should('be.visible')
    HomePage.supportTab.should('be.visible')
  })

  it('Check "Invite" page', () => {
    HomePage.inviteTab.should('be.visible')
    cy.wait(100) //whithout this "wait" cypress clicks on element when it is not attachecd to DOM yet
    HomePage.inviteTab.click()
    InvitePage.pageHeader.should('contain', 'REWARDS')
    InvitePage.iframe.should('be.visible')
    InvitePage.iframe
      .then(iframe => new Promise(resolve => setTimeout(() => resolve(iframe), 7500)))
      .then(iframe => {
        const body = iframe.contents().find('body')

        cy.wrap(body.find(InvitePage.centerTextDiv)).should(
          'contain',
          'Rewards are given to members who help our network to grow. Invite friends or complete tasks to earn more GoodDollars'
        )
        cy.wrap(body.find(InvitePage.inviteFriendsDiv)).should('contain', 'Invite Friends')
      })
  })

  it('Check "Support" page', () => {
    HomePage.supportTab.should('be.visible')
    cy.wait(100) //whithout this "wait" cypress clicks on element when it is not attachecd to DOM yet
    HomePage.supportTab.click()
    SupportPage.pageHeader.should('contain', 'Feedback & Support')
    SupportPage.iframe.should('be.visible')
    SupportPage.iframe
      .then(iframe => new Promise(resolve => setTimeout(() => resolve(iframe), 7500)))
      .then(iframe => {
        const body = iframe.contents().find('body')

        cy.wrap(body.find(SupportPage.helpFormEmail)).should('be.visible')
        cy.wrap(body.find(SupportPage.helpFormTextArea)).should('be.visible')

        cy.wrap(body.find(SupportPage.helpFormFirstName)).should('be.visible')
        cy.wrap(body.find(SupportPage.helpFormLastName)).should('be.visible')
        cy.wrap(body.find(SupportPage.submitHelpFormButton)).should('be.visible')
        cy.wrap(body.find(SupportPage.helpFormFirstName))
          .focus()
          .type('Andrew', { delay: 200 })
        cy.wrap(body.find(SupportPage.helpFormLastName))
          .focus()
          .type('Lebowski', { delay: 200 })
        cy.wrap(body.find(SupportPage.helpFormEmail))
          .focus()
          .clear()
          .type('andrey.holenkov@qatestlab.eu')
        cy.wrap(body.find(SupportPage.helpFormTextArea))
          .focus()
          .type('Test message')
        cy.wrap(body.find(SupportPage.submitHelpFormButton)).should('be.visible')

        // cy.wrap(body.find(SupportPage.helpFormSuccessMessage)).should(
        //   'contain',
        //   'Thank you, your support request has been received.'
        // )

        // cy.wrap(body.find(SupportPage.subscribeFormName)).should('be.visible')
        // cy.wrap(body.find(SupportPage.subscribeFormSurname)).should('be.visible')
        // cy.wrap(body.find(SupportPage.subscribeFormEmail)).should('be.visible')
        // cy.wrap(body.find(SupportPage.subscribeFormName)).type('Andrew')
        // cy.wrap(body.find(SupportPage.subscribeFormSurname)).type('Golenkov')
        // cy.wrap(body.find(SupportPage.subscribeFormEmail)).type('andrey.holenkov@qatestlab.eu')
        // cy.wrap(body.find(SupportPage.submitSubscribeFormButton)).click()
        // cy.wait(5000)

        //cy.wrap(body.find(SupportPage.subscribeFormSuccessMessage)).should('contain', 'Thank you for subscribing.');
        // for( let i = 0; i < 11; i++ ) {
        //     cy.wrap(body.find(SupportPage.subscribeLinks)).eq(i).should('be.visible');
        //     cy.wrap(body.find(SupportPage.subscribeLinks)).eq(i).click();
        // };
      })
  })

  it('Check sending Magic Link', () => {
    HomePage.optionsButton.should('be.visible')
    cy.wait(100) //whithout this "wait" cypress clicks on element when it is not attachecd to DOM yet
    HomePage.optionsButton.click()
    HomePage.options.eq(1).click()
    cy.get('span')
      .contains('OK')
      .should('be.visible')
    HomePage.magicLink.should('be.visible')
    HomePage.magicLink.click()
    cy.get('div')
      .contains('We sent you an email with your Magic Link')
      .should('be.visible')
    cy.get('span')
      .contains('Ok')
      .should('be.visible')
      .click()
    HomePage.claimButton.should('be.visible')
  })
})
