import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import EditProfilePage from '../PageObjects/EditProfilePage'
import SupportPage from '../PageObjects/SupportPage'
import SendMoneyPage from '../PageObjects/SendMoneyPage'
import ReceiveMoneyPage from '../PageObjects/ReceiveMoneyPage';




describe('Test case 9: Ability to send money request and reseive money', () => {

    let reseiveMoneyUrl;
    let moneyBeforeSending;

    it('User is able to send money request', async () => {

        await StartPage.open();
        StartPage.loginLink.click();         
        const wordsForSuccessfullLogin = Cypress.env('anotherAccountWords')
        for( let i = 0; i < 12; i++ ) {
            LoginPage.mnemonicInputs.eq(i).type(wordsForSuccessfullLogin[i]);
        }
        LoginPage.recoverWalletButton.click();
        cy.wait(7000)
        HomePage.receiveButton.click();
        ReceiveMoneyPage.pageHeader.should('contain', 'Receive G$');
        ReceiveMoneyPage.requestSpecificAmountButton.should('be.visible');
        ReceiveMoneyPage.shareYourWalletLinkButton.should('be.visible');
        ReceiveMoneyPage.requestSpecificAmountButton.click();
        cy.wait(3000);
        ReceiveMoneyPage.nameInput.should('be.visible');
        ReceiveMoneyPage.nextButton.should('be.visible');
        ReceiveMoneyPage.nameInput.type('Test Account');
        ReceiveMoneyPage.nextButton.click();
        cy.wait(3000);
        ReceiveMoneyPage.moneyInput.should('be.visible');
        ReceiveMoneyPage.nextButton.should('be.visible');
        ReceiveMoneyPage.moneyInput.type('0.01');
        ReceiveMoneyPage.nextButton.click();
        cy.wait(3000);
        ReceiveMoneyPage.messageInput.should('be.visible');
        ReceiveMoneyPage.nextButton.should('be.visible');
        ReceiveMoneyPage.messageInput.type('test lalala');
        ReceiveMoneyPage.nextButton.click();
        cy.wait(3000);
        ReceiveMoneyPage.nextButton.click();
        ReceiveMoneyPage.shareLinkButton.click();
        cy.wait(5000);
        reseiveMoneyUrl = await ReceiveMoneyPage.shareLinkButton.invoke('attr', 'data-url');
        //ReceiveMoneyPage.shareLinkButton.click();
        //moneyBeforeSending = await HomePage.moneyAmountDiv.invoke('text');
        //cy.log("money: " + moneyBeforeSending);
        cy.log(reseiveMoneyUrl);
        cy.wait(3000);
        HomePage.sendButton.should('be.visible')
        cy.wait(3000);

    });

    it('User is able to receive money', async () => {

        await StartPage.open();
        StartPage.loginLink.click();         
        const wordsForSuccessfullLogin = Cypress.env('wordsForSuccessfullLogin')
        for( let i = 0; i < 12; i++ ) {
            LoginPage.mnemonicInputs.eq(i).type(wordsForSuccessfullLogin[i]);
        }
        LoginPage.recoverWalletButton.click();
        cy.wait(7000)
        moneyBeforeSending = await HomePage.moneyAmountDiv.invoke('text');
        cy.log("money: " + moneyBeforeSending);
        cy.visit(reseiveMoneyUrl);
        cy.wait(7500);
        ReceiveMoneyPage.confirmWindowButton.click();

    });

})