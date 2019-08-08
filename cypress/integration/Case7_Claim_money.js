import StartPage from '../PageObjects/StartPage'
import SignUpPage from '../PageObjects/SignUpPage'
import HomePage from '../PageObjects/HomePage'
import ClaimMoneyPage from '../PageObjects/ClaimMoneyPage'
import LoginPage from '../PageObjects/LoginPage'




describe('Test case 7: Ability to claim money', () => {

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

    it('User have ability to claim money', () => {
        
        HomePage.claimButton.click();
        ClaimMoneyPage.moneyAmountDiv.should('be.visible');
        ClaimMoneyPage.image.should('be.visible');
        ClaimMoneyPage.timer.should('be.visible');
        ClaimMoneyPage.claimButton.should('be.visible');
        ClaimMoneyPage.claimButton.should('be.disabled')

    });


})