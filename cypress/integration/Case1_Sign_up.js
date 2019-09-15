import StartPage from '../PageObjects/StartPage'
import SignUpPage from '../PageObjects/SignUpPage'
import HomePage from '../PageObjects/HomePage'



describe('Test case 1: Ability to Sign Up', () => {

    it('User is not able to sign up the wallet with wrong values', () => {
        
       StartPage.open();
       StartPage.continueOnWebButton.click();
       StartPage.createWalletButton.click();
       SignUpPage.pageHeader.should('contain', 'Sign Up');
       SignUpPage.nameInput.should('be.visible');
       SignUpPage.nextButton.should('be.visible');
       SignUpPage.nameInput.type('Name');
       SignUpPage.invalidValueErrorMessage1.should('exist');
       SignUpPage.nameInput.clear();
       SignUpPage.nameInput.type('Name1 Name');
       SignUpPage.invalidValueErrorMessage2.should('exist');
       SignUpPage.nameInput.clear();
       SignUpPage.nameInput.type('Name Name');
       cy.wait(5000)
       SignUpPage.nextButton.click();
       SignUpPage.phoneInput.type('+11111');
       SignUpPage.invalidValueErrorMessage3.should('exist');
       SignUpPage.phoneInput.clear();
       SignUpPage.phoneInput.type('+9999999999999');
       SignUpPage.invalidValueErrorMessage3.should('exist');

    });


    it('User is able to sign up the wallet with correct values', () => {

        StartPage.open();
        StartPage.continueOnWebButton.click();
        StartPage.createWalletButton.click();
        cy.wait(3000);
        SignUpPage.nameInput.type('Name Name');
        SignUpPage.nextButton.click();
        SignUpPage.phoneInput.type('+380983611321');
        SignUpPage.nextButton.click();
        // SignUpPage.errorOkayButton.click();
        // SignUpPage.nextButton.click();
        cy.wait(5000);
        for( let i = 0; i < 6; i++ ) {
            cy.wait(2000)
            SignUpPage.codeInputs.eq(i).type(i, {force:true});
        }
        cy.wait(5000);
        SignUpPage.emailInput.type('gooddollar.test123@gmail.com');
        cy.wait(5000);
        SignUpPage.nextButton.click();
        cy.wait(5000);
        SignUpPage.nextButton.click();
        cy.wait(5000);
        HomePage.welcomeFeed.should('contain', 'Welcome to GoodDollar!');
        HomePage.welcomeFeed.should('contain', 'Start claiming free G$');
        HomePage.optionsButton.click();
        cy.wait(5000)
        HomePage.deleteAccountButton.click();
        cy.wait(8000)
        HomePage.confirmDeletionButton.click();
        cy.wait(15000);
        cy.log("Done!")



        // cy.window()
        //     .then( win => {
        //         const identifierValue = win.wallet.getAccountForType('login').toLowerCase();
        //         cy.request({
        //             method: 'POST', 
        //             url: 'https://good-qa.herokuapp.com/admin/user/get', 
        //             headers: { 
        //                 'content-type': 'application/json'
        //             },
        //             body: { 
        //                 password:'MashWzP8Kg',
        //                 identifier: identifierValue
        //             }}
        //             )
        //             .then( response => {
        //                 const code = response.body.user.otp.code.toString();        
        //                 const charArray = code.split('');             
        //                 for( let i = 0; i < 6; i++ ) {
        //                     cy.wait(2000)
        //                     SignUpPage.codeInputs.eq(i).type(charArray[i], {force:true});
        //                 }
        //                 cy.wait(5000);
        //                 SignUpPage.emailInput.type('gooddollarssss@gmail.com');
        //                 cy.wait(5000);
        //                 SignUpPage.nextButton.click();
        //                 cy.wait(5000);
        //                 SignUpPage.nextButton.click();
        //                 cy.wait(5000);
        //                 HomePage.welcomeFeed.should('contain', 'Welcome to GoodDollar!');
        //                 HomePage.welcomeFeed.should('contain', 'Start claiming free G$');
        //                 HomePage.optionsButton.click();
        //                 cy.wait(5000)
        //                 HomePage.deleteAccountButton.click();
        //                 cy.wait(8000)
        //                 HomePage.confirmDeletionButton.click();
        //                 cy.wait(15000);
        //                 cy.log("Done!")

        //             });

        //     }); 
                
    });

})
