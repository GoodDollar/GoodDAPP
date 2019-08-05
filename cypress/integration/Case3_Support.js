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
        
        SupportPage.iframe.iframe().find(SupportPage.helpFormEmail).should('be.visible');
        SupportPage.iframe.iframe().find(SupportPage.submitHelpFormButton).should('be.visible');
        SupportPage.iframe.iframe().find(SupportPage.helpFormTextArea, {timeout:10000}).should('be.visible');
        

        for(let i = 0; i < 8; i++) {
            SupportPage.iframe.iframe().find(SupportPage.headerLinks).eq(i).should('be.visible');
        }

        for(let i = 0; i < 11; i++) {
            SupportPage.iframe.iframe().find(SupportPage.footerLinks).eq(i).should('be.visible');
        }



       
          

   
       


    });

  

})