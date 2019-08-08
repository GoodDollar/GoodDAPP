import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import SupportPage from '../PageObjects/SupportPage'
import RecoverWalletPage from '../PageObjects/RecoverWalletPage';



describe('Test case 5: Wallet backup', () => {

    before('authorization', () => {     
        StartPage.open();
        StartPage.loginLink.click();  
        
        const wordsForSuccessfullLogin = Cypress.env('wordsForSuccessfullLogin')
        for( let i = 0; i < 12; i++ ) {
            LoginPage.mnemonicInputs.eq(i).type(wordsForSuccessfullLogin[i]);
        }
        LoginPage.recoverWalletButton.click();
        cy.wait(7000)
    });


    it('User is able to recover mnemonics by email', () => {

        HomePage.optionsButton.click();
        HomePage.options.eq(1).click();
        for( let i = 0; i < 12; i++ ){
            RecoverWalletPage.mnemonicInputs.eq(i).should('be.visible');
        }
        RecoverWalletPage.resendEmailButton.click();
        RecoverWalletPage.successMessageDiv.should('contain', 'We sent an email with recovery instructions for your wallet');


    });

  
})