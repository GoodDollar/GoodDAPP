import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'


function typeInputValues( values , isCorrect) {
    LoginPage.recoverWalletButton.should('not.be.enabled');
        for( let i = 0; i < 12; i++ ) {
            LoginPage.mnemonicInputs.eq(i).type(values[i]);
        }
    LoginPage.recoverWalletButton.click();
        if(isCorrect) {
            LoginPage.recoverWalletButton.click({ force:true });
            cy.wait(7000);
            HomePage.profileAvatar.should('be.visible');
        } else {
            LoginPage.errorWindow.should('be.visible');
            cy.contains('OK').click();
            cy.reload();
        } 
}


describe('Test case 2: Ability to do authorization', () => {

    beforeEach( () => {      
        StartPage.open();
        StartPage.loginLink.should('contain', 'Already have a wallet?');    
        StartPage.createWalletButton.should('be.visible');
        StartPage.loginLink.should('be.visible');  

        StartPage.loginLink.click();  
        LoginPage.pageHeader.should('contain', 'Recover');
        LoginPage.mnemonicInputs.should('be.visible');
    })


    it('Try to login the wallet with wrong values', () => {
 
       const wrongWords = Cypress.env('wordsForUnsuccessfullLogin');
       typeInputValues( wrongWords.withChangedWord, false );
       typeInputValues( wrongWords.withNumbers, false );
       typeInputValues( wrongWords.withSymbols, false );
       typeInputValues( wrongWords.withChangedLetter, false );
       typeInputValues( wrongWords.withChangedOrder, false );
       typeInputValues( wrongWords.withCapitalize, false );

    });


    it('Try to login the wallet with correct values', () => {
 
        const wordsForSuccessfullLogin = Cypress.env('wordsForSuccessfullLogin')
        typeInputValues( wordsForSuccessfullLogin, true )

     });

})