/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import SupportPage from '../PageObjects/SupportPage'
import InvitePage from '../PageObjects/InvitePage'
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

  it('Check is items are displayed at topbar', () => {
    HomePage.inviteTab.should('be.visible')
    HomePage.optionsButton.should('be.visible')
  })

  it('Check Invite page', () => {
    HomePage.inviteTab.should('be.visible')
    HomePage.inviteTab.click({ force: true })
    InvitePage.pageHeader.should('be.visible').contains('Invite')
    InvitePage.iframe.find(InvitePage.container).should('be.visible')
    InvitePage.iframe.find(InvitePage.inviteFriends).should('be.visible')
    InvitePage.iframe.find(InvitePage.inviteFriends).should('contain', 'Invite Your Friends')
    InvitePage.iframe.find(InvitePage.inviteShareLink).should('be.visible')
    InvitePage.iframe.find(InvitePage.inviteShareLink).should('contain', 'Share The Link')
    InvitePage.iframe.contains('Or share with:')
    InvitePage.iframe.find(InvitePage.iconWhatApp).should('be.visible')
    InvitePage.iframe.find(InvitePage.iconFB).should('be.visible')
    InvitePage.iframe.find(InvitePage.iconTwitter).should('be.visible')
    InvitePage.iframe.find(InvitePage.iconLI).should('be.visible')
    InvitePage.iframe.find(InvitePage.iconGmail).should('be.visible')
    InvitePage.iframe.find(InvitePage.buttonCopy).should('be.visible')
    InvitePage.iframe.find(InvitePage.buttonCopy).click()
    InvitePage.iframe.find(InvitePage.popupClipBoardCard).should('be.visible')
    HomePage.backArrow.click()
  })

  it.skip('Check sending Magic Link', () => {
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
    HomePage.optionsButton.click({ force: true })
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
  })

  it.skip('Check Support page', () => {
    HomePage.waitForHomePageDisplayed()
    HomePage.optionsButton.should('be.visible')
    HomePage.optionsButton.click({ force: true })
    cy.contains('Help & Feedback').click()
    SupportPage.pageHeader.should('contain', 'Help & Feedback')
    SupportPage.iframe.should('be.visible')
    SupportPage.iframe.find(SupportPage.search).should('be.visible')
    SupportPage.iframe.find(SupportPage.topics).should('be.visible')
    SupportPage.iframe.find(SupportPage.ask).should('be.visible')
    SupportPage.iframe.find(SupportPage.contactUs).should('be.visible')
    SupportPage.iframe.find(SupportPage.contactUs).click()
    SupportPage.iframe.find(SupportPage.formSend).should('be.visible')
  })
})
