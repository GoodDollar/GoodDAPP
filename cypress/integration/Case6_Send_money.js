import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import SupportPage from '../PageObjects/SupportPage'
import SendMoneyPage from '../PageObjects/SendMoneyPage'



describe('Test case 6: Sending money', () => {

    it('Send money from first account', () => {

        StartPage.open();
        StartPage.loginLink.click();         
        const wordsForSuccessfullLogin = Cypress.env('wordsForSuccessfullLogin')
        for( let i = 0; i < 12; i++ ) {
            LoginPage.mnemonicInputs.eq(i).type(wordsForSuccessfullLogin[i]);
        }
        LoginPage.recoverWalletButton.click();
        cy.wait(5000)
        HomePage.sendButton.click();
        SendMoneyPage.nameInput.type('another person');
        SendMoneyPage.nextButton.click();
        SendMoneyPage.oneButton.click();
        SendMoneyPage.nextButton.click();
        SendMoneyPage.messageInput.type('test message');
        SendMoneyPage.nextButton.click();
        SendMoneyPage.confirmButton.click();
        SendMoneyPage.copyLinkButton.click();
        SendMoneyPage.doneButton.click();

        
        HomePage.sendButton.click();
        navigator.clipboard.readText().then( data => {
            cy.log("log: " + data)
            cy.visit(data)
        })
        // SendMoneyPage.nameInput.type('{ctrl}V', {release: false, force: true})
       
        
    });



  

})