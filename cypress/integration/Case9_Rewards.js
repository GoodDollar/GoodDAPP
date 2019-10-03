/* eslint-disable lines-around-comment */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import RewardsPage from '../PageObjects/RewardsPage'
import w3Page from '../PageObjects/w3Page'
import SignUpPage from '../PageObjects/SignUpPage'




describe('Test case 9: Ability to see rewards', () => {

    it('User is able to see create a wallet with w3 token and check hass_wallet status', () => {

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
      
        // ** Check rewards page ** //
        HomePage.rewardsButton.click();
        RewardsPage.pageHeader.should('contain', 'Rewards');
        RewardsPage.iframe.should('be.visible');
        RewardsPage.iframe
            .then( iframe => new Promise(resolve => setTimeout( () => resolve(iframe), 7500 )))
            .then( iframe => {
                const body = iframe.contents().find('body');
                cy.wrap(body.find(RewardsPage.createWalletButton)).should('be.visible');
                cy.wrap(body.find(RewardsPage.contentWrapper)).should('contain', 'Redeem your rewards & collected a daily income');
                cy.wrap(body.find(RewardsPage.createWalletButton)).invoke('attr', 'href').then( createWalletUrl => {

                    // ** Extract token from button attribute ** //
                    const w3token = createWalletUrl.slice(33);
                    cy.log(w3token)
                    RewardsPage.backButton.click()

                    // ** Check if user have a wallet created with w3 token before creating new one ** //
                    cy.window()
                        .then( async win => {
                        const info = await win.api.getUserFromW3ByToken(w3token);
                        const hasWallet = info.data.has_wallet;
                        cy.log("has wallet: " + hasWallet)
                        expect(hasWallet).to.be.false                                   
                    })     

                    cy.clearCookies()
                    cy.clearLocalStorage()
                    cy.visit('https://gooddev.netlify.com/?web3=' + w3token)
                    StartPage.continueOnWebButton.click();
                    StartPage.createWalletButton.click();
                    cy.contains('Ok').click();
                    cy.wait(3000);
                    SignUpPage.phoneInput.type('+79315944375');
                    //cy.contains('Ok').click();
                    SignUpPage.nextButton.click();
                    cy.wait(3000);
                    for( let i = 0; i < 6; i++ ) {
                        cy.wait(2000)
                        SignUpPage.codeInputs.eq(i).type(i, {force:true});
                    }
                    SignUpPage.gotItButton.click()
                    SignUpPage.letStartButton.click();
                    cy.wait(25000);

                    // ** Check if user have a wallet created with w3 token after creating ** //
                    cy.window()
                        .then( async win => {
                        const info = await win.api.getUserFromW3ByToken(w3token);
                        const hasWallet = info.data.has_wallet;
                        cy.log("has wallet: " + hasWallet)
                        expect(hasWallet).to.be.true                               
                    })  

                    HomePage.optionsButton.click();
                    cy.wait(5000)
                    HomePage.deleteAccountButton.click();
                    cy.wait(15000)
                    HomePage.confirmDeletionButton.click();
                    cy.wait(30000);
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

                    // ** Check if user have a wallet created with w3 token after deleting ** //
                    cy.window()
                    .then( async win => {
                        const info = await win.api.getUserFromW3ByToken(w3token);
                        const hasWallet = info.data.has_wallet;
                        cy.log("has wallet: " + hasWallet)
                        expect(hasWallet).to.be.false
                                              
                    });  

                });
        
            });

    });

});


