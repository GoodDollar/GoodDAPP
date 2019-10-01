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

    // before('authorization', () => {     
 
    //     StartPage.open();
    //     StartPage.continueOnWebButton.click();   
    //     StartPage.signInButton.click();  
    //     LoginPage.recoverFromPassPhraseLink.click();
    //     LoginPage.pageHeader.should('contain', 'Recover');
    //     const string = Cypress.env('wordsForSuccessfullLogin').join(' ');
    //     LoginPage.mnemonicsInput.type(string);
    //     LoginPage.recoverWalletButton.click();
    //     LoginPage.yayButton.click();
    //     cy.wait(7000);
        
    // });

    it('User is able to see rewards page correctly if he has wallet without w3 account', () => {

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
        HomePage.rewardsButton.click();
        RewardsPage.pageHeader.should('contain', 'Rewards');
        RewardsPage.iframe.should('be.visible');
        RewardsPage.iframe
            .then( iframe => new Promise(resolve => setTimeout( () => resolve(iframe), 7500 )))
            .then( iframe => {
                const body = iframe.contents().find('body');

                cy.wrap(body.find(RewardsPage.createWalletButton)).should('be.visible');
                cy.wrap(body.find(RewardsPage.contentWrapper)).should('contain', 'Redeem your rewards & collected a daily income');
                // cy.wrap(body.find(RewardsPage.createWalletButton)).click();
        
            });

    })


    it('User is able to see rewards page correctly if he has w3 account without wallet', () => {

        w3Page.openPage();
        w3Page.loginTab.should('be.visible');
        w3Page.loginTab.click();
        w3Page.emailInput.should('be.visible');
        w3Page.passwordInput.should('be.visible');
        w3Page.loginButton.should('be.visible');
        w3Page.emailInput.type('testmailamy+4@gmail.com');
        w3Page.passwordInput.type('Test12345!!!');
        w3Page.loginButton.click();
        w3Page.createWalletButton.should('be.visible');
        w3Page.createWalletButton.invoke('attr', 'href').then( createWalletUrl => {
            cy.log(createWalletUrl)
            cy.wait(3000)
        })

    })

    it('User is able to create new wallet with w3 token', () => {
  
        cy.visit("https://goodqa.netlify.com/?web3=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjozMzF9LCJpYXQiOjE1Njk5MjI2NDd9.bliGhL_fb8y0Ga2-8PUPACThhNmxwttMFpZAf8A-AM0")
        StartPage.continueOnWebButton.click();
        StartPage.createWalletButton.click();
        cy.wait(3000)
        cy.contains('Ok').click();
        SignUpPage.phoneInput.type('+79315944375');
        SignUpPage.nextButton.click();
        cy.wait(3000)
        // cy.contains('Ok').click();
        // SignUpPage.nextButton.click();
        cy.wait(3000)
        cy.window()
            .then( win => {
                const identifierValue = win.wallet.getAccountForType('login').toLowerCase();
                cy.request({
                    method: 'POST', 
                    url: 'https://good-qa.herokuapp.com/admin/user/get', 
                    headers: { 
                        'content-type': 'application/json'
                    },
                    body: { 
                        password:'MashWzP8Kg',
                        identifier: identifierValue
                    }}
                    )
                    .then( response => {
                        const code = response.body.user.otp.code.toString();        
                        const charArray = code.split('');             
                        for( let i = 0; i < 6; i++ ) {
                            cy.wait(2000)
                            SignUpPage.codeInputs.eq(i).type(charArray[i], {force:true});
                        }

                        cy.wait(5000);
                        SignUpPage.nextButton.click();
                        cy.wait(5000);    
                        HomePage.welcomeFeed.should('be.visible');
                        HomePage.optionsButton.click();
                        cy.wait(5000)
                        HomePage.deleteAccountButton.click();
                        cy.wait(8000)
                        HomePage.confirmDeletionButton.click();
                        cy.wait(15000);
                        cy.log("Done!")
                

                    });

            }); 
     
    });

});

