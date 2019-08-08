import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import SupportPage from '../PageObjects/SupportPage'
import SendMoneyPage from '../PageObjects/SendMoneyPage'




describe('Test case 8: Ability to send money', () => {

    let sendMoneyUrl;


    it('User is able to send money', async () => {

        await StartPage.open();
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
        SendMoneyPage.moneyInput.type('0.01');
        SendMoneyPage.nextButton.click();
        SendMoneyPage.messageInput.type('test message');
        SendMoneyPage.nextButton.click();
        SendMoneyPage.confirmButton.click();
        cy.wait(4000)
        SendMoneyPage.copyLinkButton.click();
        cy.wait(3000)
        sendMoneyUrl = await SendMoneyPage.doneButton.invoke('attr', 'data-url')
        cy.wait(3000)
        SendMoneyPage.doneButton.click();
        cy.wait(4000)
    
    });

    it('Another user is able to receive money', () => {
        
        StartPage.open();
        StartPage.loginLink.click();         
        const wordsForSuccessfullLogin2 = Cypress.env('anotherAccountWords')
        for( let i = 0; i < 12; i++ ) {
            LoginPage.mnemonicInputs.eq(i).type(wordsForSuccessfullLogin2[i]); 
        }
        LoginPage.recoverWalletButton.click();
        cy.wait(7000)
        HomePage.moneyAmountDiv.invoke('text').then( moneyBefore => {
            cy.wait(7000)
            cy.log('Money before sending: ' + moneyBefore )    
            cy.visit(sendMoneyUrl)
            cy.wait(15000)
            cy.visit('https://goodqa.netlify.com/AppNavigation/Dashboard/Home')
            cy.wait(7000)
            HomePage.moneyAmountDiv.invoke('text').then( moneyAfter => {
                cy.wait(3000)
                cy.log('Money after sending: ' + moneyBefore )
                expect(Number(moneyBefore) + 0.01).to.be.equal( Number(moneyAfter) )
            });
            
       });
        

    })


})