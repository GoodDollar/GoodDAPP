/* eslint-disable lines-around-comment */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
import StartPage from '../PageObjects/StartPage'
import LoginPage from '../PageObjects/LoginPage'
import HomePage from '../PageObjects/HomePage'
import RewardsPage from '../PageObjects/RewardsPage'
import w3Page from '../PageObjects/w3Page'




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

    // it('User is able to see rewards page correctly if he has wallet without w3 account', () => {

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
    //     HomePage.rewardsButton.click();
    //     RewardsPage.pageHeader.should('contain', 'Rewards');
    //     RewardsPage.iframe.should('be.visible');
    //     RewardsPage.iframe
    //         .then( iframe => new Promise(resolve => setTimeout( () => resolve(iframe), 7500 )))
    //         .then( iframe => {
    //             const body = iframe.contents().find('body');

    //             cy.wrap(body.find(RewardsPage.createWalletButton)).should('be.visible');
    //             cy.wrap(body.find(RewardsPage.contentWrapper)).should('contain', 'Redeem your rewards & collected a daily income');
    //             // cy.wrap(body.find(RewardsPage.createWalletButton)).click();
        
    //         });

    // })

    let url;

    it('User is able to see rewards page correctly if he has w3 account without wallet (register new wallet)', () => {

        w3Page.openPage();
        w3Page.loginTab.should('be.visible');
        w3Page.loginTab.click();
        w3Page.emailInput.should('be.visible');
        w3Page.passwordInput.should('be.visible');
        w3Page.loginButton.should('be.visible');
        w3Page.emailInput.type('testmailamy+11@gmail.com');
        w3Page.passwordInput.type('Test12345!!!');
        w3Page.loginButton.click();
        w3Page.createWalletButton.should('be.visible');
        w3Page.createWalletButton.invoke('attr', 'href').then( async createWalletUrl => {
            cy.wait(3000)
            cy.log(createWalletUrl)
            Cypress.env("myVar1", createWalletUrl);
            url = createWalletUrl;
            cy.wait(3000)
            // cy.visit(createWalletUrl)
            //
            
            Cypress.env("newWalletLink", createWalletUrl);
            // StartPage.continueOnWebButton.should('be.visible');
            // StartPage.continueOnWebButton.click();
            // StartPage.createWalletButton.click();
            // SignUpPage.pageHeader.should('contain', 'Sign Up');
            // SignUpPage.phoneInput.should('be.visible');
            // SignUpPage.phoneInput.type('+380983611320');
            // cy.wait(5000);
            //   cy.window()
            // .then( win => {
            //     const identifierValue = win.wallet.getAccountForType('login').toLowerCase();
            //     cy.request({
            //         method: 'POST', 
            //         url: 'https://good-qa.herokuapp.com/admin/user/get', 
            //         headers: { 
            //             'content-type': 'application/json'
            //         },
            //         body: { 
            //             password:'MashWzP8Kg',
            //             identifier: identifierValue
            //         }}
            //         )
            //         .then( response => {
            //             const code = response.body.user.otp.code.toString();        
            //             const charArray = code.split('');             
            //             for( let i = 0; i < 6; i++ ) {
            //                 cy.wait(2000)
            //                 SignUpPage.codeInputs.eq(i).type(charArray[i], {force:true});
            //             }
            //             cy.wait(5000);
            //             SignUpPage.nextButton.click();
            //             cy.wait(5000);
            //             HomePage.welcomeFeed.should('contain', 'Welcome to GoodDollar!');
            //             HomePage.welcomeFeed.should('contain', 'Start claiming free G$');
            //             HomePage.optionsButton.click();
            //             cy.wait(5000)
            //             HomePage.deleteAccountButton.click();
            //             cy.wait(8000)
            //             HomePage.confirmDeletionButton.click();
            //             cy.wait(15000);
            //             cy.log("Done!")

            //         });

            // }); 

       
        })

    })

    it('lalala', () => {
  
        cy.visit(Cypress.env('newWalletLink'))
        cy.wait(15000)

       
     
    })

    

})

