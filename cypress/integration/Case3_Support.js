import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import SupportPage from '../PageObjects/SupportPage'



describe('Test case 3: Support', () => {

    before('authorization', () => {     
        StartPage.open();
        StartPage.loginLink.click();  
        
        const wordsForSuccessfullLogin = Cypress.env('wordsForSuccessfullLogin')
        for( let i = 0; i < 12; i++ ) {
            LoginPage.mnemonicInputs.eq(i).type(wordsForSuccessfullLogin[i]);
        }
        LoginPage.recoverWalletButton.click();
        cy.wait(5000)
    });


    it('User is able to send forms and follow the links', () => {

        HomePage.optionsButton.click( {force: true} );
        HomePage.options.eq(5).click( {force: true} );
        SupportPage.pageHeader.should('contain', 'Feedback & Support');
        SupportPage.iframe.should('be.visible');

        SupportPage.iframe
            .then((iframe) => new Promise(resolve => setTimeout(() => resolve(iframe), 7500)))
            .then(function (iframe) {
                const body = iframe.contents().find('body');

                cy.wrap(body.find(SupportPage.helpFormEmail)).should('be.visible');
                cy.wrap(body.find(SupportPage.helpFormTextArea)).should('be.visible');
                cy.wrap(body.find(SupportPage.submitHelpFormButton)).should('be.visible');
                cy.wrap(body.find(SupportPage.helpFormEmail)).clear().type('andrey.holenkov@qatestlab.eu');
                cy.wrap(body.find(SupportPage.helpFormTextArea)).type('Test message');
                cy.wrap(body.find(SupportPage.submitHelpFormButton)).click();
                cy.wait(5000)
                cy.wrap(body.find(SupportPage.helpFormSuccessMessage)).should('contain', 'Thank you, your support request has been received.');


                cy.wrap(body.find(SupportPage.subscribeFormName)).should('be.visible');
                cy.wrap(body.find(SupportPage.subscribeFormSurname)).should('be.visible');
                cy.wrap(body.find(SupportPage.subscribeFormEmail)).should('be.visible');
                cy.wrap(body.find(SupportPage.subscribeFormName)).type('Andrew')
                cy.wrap(body.find(SupportPage.subscribeFormSurname)).type('Golenkov')
                cy.wrap(body.find(SupportPage.subscribeFormEmail)).type('andrey.holenkov@qatestlab.eu')
                cy.wrap(body.find(SupportPage.submitSubscribeFormButton)).click();
                cy.wait(5000)
                cy.wrap(body.find(SupportPage.subscribeFormSuccessMessage)).should('contain', 'Thank you for subscribing.');


                for( let i = 0; i < 11; i++ ) {
                    cy.wrap(body.find(SupportPage.subscribeLinks)).eq(i).should('be.visible');
                    cy.wrap(body.find(SupportPage.subscribeLinks)).eq(i).click();         
                };

            });

    });

});