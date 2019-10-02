import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import SendMoneyPage from '../PageObjects/SendMoneyPage'




describe('Test case 7: Ability to send money', () => {

    it('User is able to send money', () => {

    
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
        HomePage.sendButton.click();
        SendMoneyPage.nameInput.type('another person');
        SendMoneyPage.nextButton.click();
        SendMoneyPage.moneyInput.type('0.01');
        SendMoneyPage.nextButton.click();
        SendMoneyPage.messageInput.type('test message');
        SendMoneyPage.nextButton.click();
        cy.wait(7000);
        SendMoneyPage.confirmButton.click();
        cy.wait(4000)
        SendMoneyPage.copyLinkButton.click();
        cy.wait(3000)
        SendMoneyPage.doneButton.should('be.visible')
        SendMoneyPage.doneButton.invoke('attr', 'data-url').then( sendMoneyUrl => {
            cy.wait(3000)
           //  SendMoneyPage.doneButton.click();
            cy.wait(4000);
            cy.clearLocalStorage();
            cy.clearCookies();
            StartPage.open();
            StartPage.continueOnWebButton.click();   
            StartPage.signInButton.click();  
            LoginPage.recoverFromPassPhraseLink.click();
            LoginPage.pageHeader.should('contain', 'Recover');
            const string2 = Cypress.env('anotherAccountWords').join(' ');
            LoginPage.mnemonicsInput.type(string2);
            LoginPage.recoverWalletButton.click();
            LoginPage.yayButton.click();
            cy.wait(12000);
            HomePage.claimButton.should('be.visible');
            HomePage.moneyAmountDiv.invoke('text').then( moneyBefore => {
                cy.wait(7000)
                cy.log('Money before sending: ' + moneyBefore )    
                cy.visit(sendMoneyUrl)
                cy.wait(20000)
                cy.visit(Cypress.env('baseUrl') + '/AppNavigation/Dashboard/Home')
                cy.wait(7000)
                HomePage.moneyAmountDiv.invoke('text').then( moneyAfter => {
                    cy.wait(3000)
                    cy.log('Money after sending: ' + moneyAfter)
                    expect(Number(moneyBefore) + 0.01).to.be.equal( Number(moneyAfter) )
                });
                
           });
       
        })
            
    });

});