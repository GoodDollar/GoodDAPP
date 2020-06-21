/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import SupportPage from '../PageObjects/SupportPage'
//import InvitePage from '../PageObjects/InvitePage'
import StatisticsPage from '../PageObjects/StatisticsPage'

describe('Test case 4: Check menu items functionality', () => {
  before('authorization', () => {
    localStorage.clear()
    StartPage.open()
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    cy.readFile('cypress/fixtures/userMnemonicSave.txt', { timeout: 10000 }).then(mnemonic => {
      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.waitForHomePageDisplayed()
    })
  })

  // it('Check is items are displayed at topbar', () => {
  //   //HomePage.inviteTab.should('be.visible')
  //   HomePage.optionsButton.should('be.visible')
  // })

  /*it('Check "Invite" page', () => {
    HomePage.inviteTab.should('be.visible')
    HomePage.inviteTab.click()
    InvitePage.pageHeader.should('contain', 'Invite')
    InvitePage.iframe.should('be.visible')
    InvitePage.iframe
      .then(iframe => new Promise(resolve => setTimeout(() => resolve(iframe), 8500)))
      .then(iframe => {
        const body = iframe.contents().find('body')
        cy.wrap(body.find(InvitePage.centerTextDiv)).should('contain', 'Invite 3 friends to secure')
        cy.wrap(body.find(InvitePage.inviteFriendsDiv)).should('contain', 'Invite Friends')
      })
  })*/

  it('Check sending Magic Link', () => {
    HomePage.optionsButton.should('be.visible')
    HomePage.optionsButton.click({ force: true })
    cy.contains('Magic Link').click()
    HomePage.magicLink.should('be.visible')
    HomePage.magicLink.click()
    cy.get('span')
      .contains('OK')
      .should('be.visible')
    cy.get('div')
      .contains('We sent you an email with your Magic Link')
      .should('be.visible')
    cy.get('span')
      .contains('Ok')
      .should('be.visible')
      .click()
    HomePage.claimButton.should('be.visible')
    //HomePage.backArrow.click()
  })

  it('Check Statistics page', () => {
    HomePage.waitForHomePageDisplayed()
    HomePage.optionsButton.should('be.visible')
    HomePage.optionsButton.click()
    cy.contains('Statistics').click()
    StatisticsPage.headerPage.should('be.visible').contains('Statistics')
    StatisticsPage.iframe.find(StatisticsPage.container).should('be.visible')
    StatisticsPage.iframe
      .find(StatisticsPage.container)
      .find('.MuiGrid-item')
      .should('be.visible')

    //StatisticsPage.iframe.contains('General')
    StatisticsPage.iframe.contains('User Accounts Balance')
    StatisticsPage.iframe.contains('User Transactions')
    StatisticsPage.iframe.contains('Transactions')
    StatisticsPage.iframe.contains('Daily G$ Usage').click()
    HomePage.backArrow.click()

    // StatisticsPage.iframe.should('be.visible')
    // StatisticsPage.iframe
    //   .then(iframe => new Promise(resolve => setTimeout(() => resolve(iframe), 7500)))
    //   .then(iframe => {
    //     const body = iframe.contents().find('body')
    //     cy.wrap(body.find(StatisticsPage.burgerButton))
    //       .eq(0)
    //       .should('be.visible')
    //     cy.wrap(body.find(StatisticsPage.burgerButton))
    //       .eq(0)
    //       .click()
    //     cy.wrap(body.find(StatisticsPage.dashboardButton)).should('be.visible')
    //     cy.wrap(body).type('{esc}')
    //     cy.wrap(body.find(StatisticsPage.container)).should('be.visible')
    //     cy.wrap(body.find(StatisticsPage.container)).contains('General')
    //     cy.wrap(body.find(StatisticsPage.container)).contains('User Accounts Balance')
    //     cy.wrap(body.find(StatisticsPage.container)).contains('User Transactions')
    //     cy.wrap(body.find(StatisticsPage.container)).contains('Transactions')
    //     cy.wrap(body.find(StatisticsPage.container))
    //       .contains('Daily G$ usage')
    //       .click()
    //   })
  })

  it('Check support page', () => {
    HomePage.waitForHomePageDisplayed()
    HomePage.optionsButton.should('be.visible')
    HomePage.optionsButton.click({ force: true })
    cy.contains('Support & Feedback').click()
    SupportPage.pageHeader.should('contain', 'Support & Feedback')
    SupportPage.iframe.should('be.visible')
    SupportPage.iframe.find(SupportPage.search).should('be.visible')
    SupportPage.iframe.find(SupportPage.topics).should('be.visible')
    SupportPage.iframe.find(SupportPage.ask).should('be.visible')

    // cy.wrap(body.find(SupportPage.helpFormEmail)).should('be.visible')
    // cy.wrap(body.find(SupportPage.helpFormTextArea)).should('be.visible')
    // cy.wrap(body.find(SupportPage.helpFormFirstName)).should('be.visible')
    // cy.wrap(body.find(SupportPage.helpFormLastName)).should('be.visible')
    // cy.wrap(body.find(SupportPage.submitHelpFormButton)).should('be.visible')
    // cy.wrap(body.find(SupportPage.helpFormFirstName))
    //     .focus()
    //     .type('Andrew', { delay: 200 })
    // cy.wrap(body.find(SupportPage.helpFormLastName))
    //     .focus()
    //     .type('Lebowski', { delay: 200 })
    // cy.wrap(body.find(SupportPage.helpFormEmail))
    //     .focus()
    //     .clear()
    //     .type('andrey.holenkov@qatestlab.eu')
    // cy.wrap(body.find(SupportPage.helpFormTextArea))
    //     .focus()
    //     .type('Test message')
    // cy.wrap(body.find(SupportPage.submitHelpFormButton)).should('be.visible')

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
