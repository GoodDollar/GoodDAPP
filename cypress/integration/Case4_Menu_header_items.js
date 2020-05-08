/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import SupportPage from '../PageObjects/SupportPage'
import InvitePage from '../PageObjects/InvitePage'

describe('Test case 4: Ability to send support request and subscribe', () => {
    beforeEach('authorization', () => {
        StartPage.open()
            //StartPage.continueOnWebButton.click()
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
            //HomePage.goodmarketTab.should('be.visible')
            //HomePage.supportTab.should('be.visible')
    })

    it('Check "Invite" tab', () => {
        HomePage.inviteTab.should('be.visible')
        HomePage.inviteTab.click()
            //cy.contains('G$10')
        InvitePage.pageHeader.should('contain', 'Invite')
        InvitePage.iframe.should('be.visible')
        InvitePage.iframe
            .then(iframe => new Promise(resolve => setTimeout(() => resolve(iframe), 8500)))
            .then(iframe => {
                const body = iframe.contents().find('body')

                cy.wrap(body.find(InvitePage.centerTextDiv)).should(
                    'contain',
                    'Invite 3 friends to secure'
                )
                cy.wrap(body.find(InvitePage.inviteFriendsDiv)).should('contain', 'Invite Friends')
            })
    })

    it('Check support page', () => {
        //cy.contains('Andrew Second')
        //HomePage.supportTab.click()
        HomePage.optionsButton.click()
        cy.contains('Support & FAQ').click()
        SupportPage.pageHeader.should('contain', 'Support & FAQ')
        SupportPage.iframe.should('be.visible')
        SupportPage.iframe
            .then(iframe => new Promise(resolve => setTimeout(() => resolve(iframe), 7500)))
            .then(iframe => {
                const body = iframe.contents().find('body')

                cy.wrap(body.find(SupportPage.search)).should('be.visible')
                cy.wrap(body.find(SupportPage.topics)).should('be.visible')
                cy.wrap(body.find(SupportPage.ask)).should('be.visible')
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
                // cy.wrap(body.find(SupportPage.submitHelpFormButton)).click()

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
})