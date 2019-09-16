import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import SupportPage from '../PageObjects/SupportPage'



describe('Test case 4: Ability to send support request and subscribe', () => {

    before('authorization', () => {   

        StartPage.open();
        StartPage.continueOnWebButton.click();   
        StartPage.signInButton.click();  
        LoginPage.recoverFromPassPhraseLink.click();
        LoginPage.pageHeader.should('contain', 'Recover');
        const string = Cypress.env('wordsForSuccessfullLogin').join(' ');
        LoginPage.mnemonicsInput.type(string);
        LoginPage.recoverWalletButton.click();
        LoginPage.yayButton.click();
        cy.wait(7000);

    });


    it('User is able to send forms and follow the links', () => {

        HomePage.optionsButton.click( {force: true} );
        HomePage.options.eq(4).click( {force: true} );
        SupportPage.pageHeader.should('contain', 'Feedback & Support');
        SupportPage.iframe.should('be.visible');
        SupportPage.iframe
            .then( iframe => new Promise(resolve => setTimeout( () => resolve(iframe), 7500 )))
            .then( iframe => {
                const body = iframe.contents().find('body');

                cy.wrap(body.find(SupportPage.helpFormEmail)).should('be.visible');
                cy.wrap(body.find(SupportPage.helpFormTextArea)).should('be.visible');
                cy.wrap(body.find(SupportPage.helpFormFirstName)).should('be.visible');
                cy.wrap(body.find(SupportPage.helpFormLastName)).should('be.visible');
                cy.wrap(body.find(SupportPage.submitHelpFormButton)).should('be.visible');
                cy.wrap(body.find(SupportPage.helpFormFirstName)).type('Andrew');
                cy.wrap(body.find(SupportPage.helpFormLastName)).type('Lebowski');
                cy.wrap(body.find(SupportPage.helpFormEmail)).clear().type('andrey.holenkov@qatestlab.eu');
                cy.wrap(body.find(SupportPage.helpFormTextArea)).type('Test message');
                cy.wrap(body.find(SupportPage.submitHelpFormButton)).click();
                cy.wait(5000);
                cy.wrap(body.find(SupportPage.helpFormSuccessMessage)).should('contain', 'Thank you, your support request has been received.');
                cy.wrap(body.find(SupportPage.subscribeFormName)).should('be.visible');
                cy.wrap(body.find(SupportPage.subscribeFormSurname)).should('be.visible');
                cy.wrap(body.find(SupportPage.subscribeFormEmail)).should('be.visible');
                cy.wrap(body.find(SupportPage.subscribeFormName)).type('Andrew')
                cy.wrap(body.find(SupportPage.subscribeFormSurname)).type('Golenkov')
                cy.wrap(body.find(SupportPage.subscribeFormEmail)).type('andrey.holenkov@qatestlab.eu')
                cy.wrap(body.find(SupportPage.submitSubscribeFormButton)).click();
                cy.wait(5000);
                cy.wrap(body.find(SupportPage.subscribeFormSuccessMessage)).should('contain', 'Thank you for subscribing.');
                for( let i = 0; i < 11; i++ ) {
                    cy.wrap(body.find(SupportPage.subscribeLinks)).eq(i).should('be.visible');
                    cy.wrap(body.find(SupportPage.subscribeLinks)).eq(i).click();         
                };

            });

    });

});