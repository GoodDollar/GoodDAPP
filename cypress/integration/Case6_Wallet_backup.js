import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import SupportPage from '../PageObjects/SupportPage'
import RecoverWalletPage from '../PageObjects/RecoverWalletPage';



describe('Test case 6: Ability to send recovering email', () => {

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


    it('User is able to recover mnemonics by email', () => {

        cy.wait(3000)
        HomePage.optionsButton.click();
        HomePage.options.eq(1).click();
        for( let i = 0; i < 12; i++ ){
            RecoverWalletPage.mnemonicInputs.eq(i).should('be.visible');
        }
        RecoverWalletPage.resendEmailButton.click();
        RecoverWalletPage.successMessageDiv.should('contain', 'We sent an email with recovery instructions for your wallet');


    });

  
})